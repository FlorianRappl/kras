import type { EventEmitter } from 'events';
import {
  proxyRequest,
  defaultProxyHeaders,
  getPort,
  isEncrypted,
  proxyWebSocket,
  WebSocketDisposer,
  ProxyRequestInfo,
  integrateXfwd,
} from '../helpers';
import type {
  KrasInjector,
  KrasAnswer,
  KrasInjectorConfig,
  KrasConfiguration,
  KrasRequest,
  KrasInjectorOptions,
  KrasWebSocketEvent,
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
  [id: string]: WebSocketDisposer;
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

    core.on('user-connected', (e: KrasWebSocketEvent) => {
      if (!e.handled) {
        const [target] = this.connectors.filter((m) => m.target === e.target);

        if (target) {
          const { id, ws, req } = e;
          const url = target.address + e.url;
          const details = {
            headers: req.headers,
            remoteAddress: req.connection.remoteAddress || req.socket.remoteAddress,
            port: getPort(req),
            encrypted: isEncrypted(req),
          };
          const headers = this.makeHeaders(details, 'ws');
          this.sessions[e.id] = proxyWebSocket({
            id,
            ws,
            headers,
            url,
            core,
          });
        }
      }
    });

    core.on('user-disconnected', (e: KrasWebSocketEvent) => {
      const dispose = this.sessions[e.id];
      dispose?.();
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
    const headers = headerNames.reduce(
      (headers, header) => {
        const value = injectHeaders[header] ?? req.headers[header];

        if (value !== undefined) {
          headers[header] = value;
        }

        return headers;
      },
      {} as Record<string, string | Array<string>>,
    );

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
      return proxyRequest({
        headers,
        url: target.address + req.url,
        method: req.method,
        body: req.rawContent,
        agentOptions: this.config.agentOptions,
        proxy: this.config.proxy,
        injector: {
          name: this.name,
          host: target,
        },
        redirect: this.config.followRedirect,
      }).catch((err: Error): undefined => {
        this.logError(err);
        return undefined;
      });
    }
  }
}
