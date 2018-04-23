import * as WebSocket from 'ws';
import { Request } from 'express';
import { EventEmitter } from 'events';
import { proxyRequest } from '../helpers/proxy-request';
import { KrasInjector, KrasAnswer, KrasInjectorConfig, KrasConfiguration, KrasRequest, KrasInjectorOptions } from '../types';

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
  private readonly options: KrasInjectorConfig & ProxyInjectorConfig;
  private readonly core: EventEmitter;
  private readonly map: {
    [target: string]: string;
  };

  constructor(options: KrasInjectorConfig & ProxyInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    this.options = options;
    this.map = config.map;
    this.core = core;

    core.on('user-connected', e => {
      const url = this.map[e.target] + e.url;
      let open = false;
      const buffer: Array<BufferEntry> = [];
      const ws = new WebSocket(url, {
        rejectUnauthorized: false,
        protocol: e.ws.protocol,
      });
      ws.on('open', () => {
        open = true;

        if (buffer.length) {
          releaseFrom(buffer, ws);
        }
      });
      ws.on('close', e => {
        core.emit('ws-closed', { reason: e });
      });
      ws.on('message', data => {
        core.emit('message', { content: data, from: url, to: e.id });
        e.ws.send(data, (err: Error) => core.emit('error', err));
      });
      e.ws.on('message', (data: WebSocket.Data) => {
        core.emit('message', { content: data, to: url, from: e.id });

        if (open) {
          ws.send(data, (err: Error) => core.emit('error', err));
        } else {
          buffer.push({
            time: Date.now(),
            data,
          })
        }
      });
      ws.on('error', err => core.emit('error', err.error));
      this.sessions[e.id] = ws;
    });

    core.on('user-disconnected', e => {
      const ws = this.sessions[e.id];
      ws.close();
      delete this.sessions[e.id];
    });
  }

  getOptions(): KrasInjectorOptions {
    const options: KrasInjectorOptions = {};

    for (const target of Object.keys(this.map)) {
      options[target] = {
        description: `Determines where to proxy to if local URL starts with ${target}.`,
        title: `Target: ${target}`,
        type: 'text',
        value: this.map[target],
      };
    }

    return options;
  }

  setOptions(options: DynamicProxyInjectorConfig): void {
    for (const target of Object.keys(options)) {
      this.map[target] = options[target];
    }
  }

  get name() {
    return 'proxy-injector';
  }

  get active() {
    return this.options.active;
  }

  set active(value: boolean) {
    this.options.active = value;
  }

  handle(req: KrasRequest) {
    return new Promise<KrasAnswer>((resolve) => {
      const target = this.map[req.target];
      const name = this.name;
      const label = {
        name,
        host: {
          name: target,
        },
      };
      proxyRequest({
        headers: req.headers,
        url: target + req.url,
        method: req.method,
        body: req.content,
        agentOptions: this.options.agentOptions,
        proxy: this.options.proxy,
      }, (err, ans) => {
        if (err) {
          this.core.emit('error', err);
        }

        resolve(ans);
      }, label);
    });
  }
}
