import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { proxyRequest } from '../helpers';
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
}

export interface DynamicProxyInjectorConfig {
  [target: string]: string;
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
      .filter(target => config.map[target] !== false)
      .map(target => ({
        target,
        address: config.map[target] as string,
      }));
    this.core = core;

    core.on('user-connected', e => {
      const [target] = this.connectors.filter(m => m.target === e.target);

      if (target) {
        let open = false;
        const url = target.address + e.url;
        const buffer: Array<BufferEntry> = [];
        const ws = new WebSocket(url, e.ws.protocol, {
          rejectUnauthorized: false,
        });
        ws.on('open', () => {
          open = true;

          if (buffer.length) {
            releaseFrom(buffer, ws);
          }
        });
        ws.on('close', e => {
          open = false;
          core.emit('ws-closed', { reason: e });
        });
        ws.on('message', data => {
          core.emit('message', { content: data, from: url, to: e.id, remote: true });
          e.ws.send(data, (err: Error) => core.emit('error', err));
        });
        e.ws.on('message', (data: WebSocket.Data) => {
          core.emit('message', { content: data, to: url, from: e.id, remote: false });

          if (open) {
            ws.send(data, err => core.emit('error', err));
          } else {
            buffer.push({
              time: Date.now(),
              data,
            });
          }
        });
        ws.on('error', err => core.emit('error', err));
        this.sessions[e.id] = ws;
      }
    });

    core.on('user-disconnected', e => {
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

  handle(req: KrasRequest): Promise<KrasAnswer> | KrasAnswer {
    const defaultHeaders = this.config.defaultHeaders || ["authorization", "accept", "content-type", "cookie", "accept-language", "user-agent", "if-match", "if-range", "if-unmodified-since", "if-none-match", "if-modified-since", "pragma", "range"];
    const discardHeaders = this.config.discardHeaders || [];
    const permitHeaders = this.config.permitHeaders || [];
    const allowHeaders = [...defaultHeaders.filter(header => !discardHeaders.includes(header.toLowerCase())), ...permitHeaders];
    const headers = allowHeaders.reduce((headers, header) => {
      header = header.toLowerCase();
      if(req.headers[header]){
        headers[header] = req.headers[header];
      }
      return headers;
    }, {});
    const [target] = this.connectors.filter(m => m.target === req.target);

    if (target) {
      return new Promise<KrasAnswer>(resolve =>
        proxyRequest(
          {
            headers: headers,
            url: target.address + req.url,
            method: req.method,
            body: req.content,
            agentOptions: this.config.agentOptions,
            proxy: this.config.proxy,
            injector: {
              name: this.name,
              host: target,
            },
            followRedirect: req.config.followRedirect || true,
          },
          (err, ans) => {
            if (err) {
              this.core.emit('error', err);
            }

            resolve(ans);
          },
        ),
      );
    }
  }
}
