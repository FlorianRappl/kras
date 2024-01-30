import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { proxyRequest, defaultProxyHeaders, getPort, isEncrypted } from '../helpers';
import {
  KrasInjector,
  KrasAnswer,
  KrasInjectorConfig,
  KrasConfiguration,
  KrasRequest,
  KrasInjectorOptions,
} from '../types';

export interface ProxyInjectorConfig {
  agentOptions?: any;
  proxy?: any;
  xfwd?: boolean;
  defaultHeaders?: Array<string>;
  discardHeaders?: Array<string>;
  permitHeaders?: Array<string>;
  injectHeaders?: Record<string, string>;
  followRedirect?: boolean;
}

export interface DynamicProxyInjectorConfig {
  [target: string]: string;
}

function normalizeHeader(header: string) {
  return header.toLowerCase();
}

interface WebSocketSessions {
  [id: string]: WebSocket;
}

interface BufferEntry {
  time: number;
  data: WebSocket.Data;
}

function releaseFrom(buffer: Array<BufferEntry>, ws: WebSocket) {
  const item = buffer.shift();
  ws.send(item.data);

  if (buffer.length) {
    const diff = buffer[0].time - item.time;
    setTimeout(() => releaseFrom(buffer, ws), diff);
  }
}

interface ProxyRequestInfo {
  remoteAddress: string;
  port: string;
  encrypted: boolean;
  headers: Record<string, string | Array<string>>;
}

function integrateXfwd(headers: Record<string, string | Array<string>>, protocol: string, req: ProxyRequestInfo) {
  const values: Record<string, string> = {
    for: req.remoteAddress,
    port: req.port,
    proto: req.encrypted ? `${protocol}s` : protocol,
  };

  Object.keys(values).forEach((key) => {
    const forwardKey = `x-forwarded-${key}`;
    const forward = headers[forwardKey] || '';
    const sep = forward ? ',' : '';
    headers[forwardKey] = forward + sep + values[key];
  });
}

export default class ProxyInjector implements KrasInjector {
  private readonly sessions: WebSocketSessions = {};
  private readonly core: EventEmitter;
  private readonly connectors: Array<{
    target: string;
    address: string;
  }>;

  public config: KrasInjectorConfig & ProxyInjectorConfig;

  constructor(options: KrasInjectorConfig & ProxyInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    this.config = options;
    this.connectors = Object.keys(config.map)
      .filter((target) => config.map[target] !== false)
      .map((target) => ({
        target,
        address: config.map[target] as string,
      }));
    this.core = core;

    core.on('user-connected', (e) => {
      const [target] = this.connectors.filter((m) => m.target === e.target);

      if (target) {
        let open = false;
        const url = target.address + e.url;
        const req = e.req;
        const details = {
          headers: req.headers,
          remoteAddress: req.connection.remoteAddress || req.socket.remoteAddress,
          port: getPort(req),
          encrypted: isEncrypted(req),
        };
        const buffer: Array<BufferEntry> = [];
        const headers = this.makeHeaders(details, 'ws');

        const ws = new WebSocket(url, e.ws.protocol, {
          rejectUnauthorized: false,
          headers,
        });
        ws.on('error', (err) => this.logError(err));
        ws.on('open', () => {
          open = true;

          if (buffer.length) {
            releaseFrom(buffer, ws);
          }
        });
        ws.on('close', (e) => {
          open = false;
          core.emit('ws-closed', { reason: e });
        });
        ws.on('message', (data) => {
          core.emit('message', { content: data, from: url, to: e.id, remote: true });
          e.ws.send(data, (err: Error) => this.logError(err));
        });
        e.ws.on('message', (data: WebSocket.Data) => {
          core.emit('message', { content: data, to: url, from: e.id, remote: false });

          if (open) {
            ws.send(data, (err) => this.logError(err));
          } else {
            buffer.push({
              time: Date.now(),
              data,
            });
          }
        });
        this.sessions[e.id] = ws;
      }
    });

    core.on('user-disconnected', (e) => {
      const ws = this.sessions[e.id];
      ws && ws.close();
      delete this.sessions[e.id];
    });
  }

  getOptions(): KrasInjectorOptions {
    const options: KrasInjectorOptions = {};

    for (const { target, address } of this.connectors) {
      options[target] = {
        description: `Determines where to proxy to if local URL starts with "${target}".`,
        title: `Target: ${target}`,
        type: 'text',
        value: address,
      };
    }

    return options;
  }

  setOptions(options: DynamicProxyInjectorConfig): void {
    for (const item of this.connectors) {
      const address = options[item.target];

      if (address !== undefined) {
        item.address = address;
      }
    }
  }

  get name() {
    return 'proxy-injector';
  }

  get active() {
    return this.config.active;
  }

  set active(value: boolean) {
    this.config.active = value;
  }

  makeHeaders(req: ProxyRequestInfo, protocol: string) {
    const defaultHeaders = (this.config.defaultHeaders || defaultProxyHeaders).map(normalizeHeader);
    const discardHeaders = (this.config.discardHeaders || []).map(normalizeHeader);
    const permitHeaders = (this.config.permitHeaders || []).map(normalizeHeader);
    const injectHeaders = this.config.injectHeaders || {};
    const headerNames = [
      ...defaultHeaders.filter((header) => !discardHeaders.includes(header)),
      ...permitHeaders,
      ...Object.keys(injectHeaders),
    ];
    const headers = headerNames.reduce((headers, header) => {
      const value = injectHeaders[header] ?? req.headers[header];

      if (value !== undefined) {
        headers[header] = value;
      }

      return headers;
    }, {} as Record<string, string | Array<string>>);

    if (this.config.xfwd) {
      integrateXfwd(headers, protocol, req);
      headers['x-forwarded-host'] = headers['x-forwarded-host'] || req.headers.host || '';
    }

    return headers;
  }

  logError(err: any) {
    if (err) {
      this.core.emit('error', err);
    }
  }

  handle(req: KrasRequest): Promise<KrasAnswer> | KrasAnswer {
    const [target] = this.connectors.filter((m) => m.target === req.target);

    if (target) {
      const headers = this.makeHeaders(req, 'http');

      return new Promise<KrasAnswer>((resolve) =>
        proxyRequest(
          {
            headers,
            url: target.address + req.url,
            method: req.method,
            body: req.content,
            agentOptions: this.config.agentOptions,
            proxy: this.config.proxy,
            injector: {
              name: this.name,
              host: target,
            },
            redirect: this.config.followRedirect,
          },
          (err, ans) => {
            this.logError(err);
            resolve(ans);
          },
        ),
      );
    }
  }
}
