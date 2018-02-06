import * as express from 'express';
import * as expressWs from 'express-ws';
import { Application, Request, Response } from 'express';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https';
import { text } from 'body-parser';
import { EventEmitter } from 'events';
import { readSsl } from './readSsl';
import { corsHandler } from './proxy';
import { WebServerConfiguration, KrasServerHook, BaseKrasServer, KrasServerMethods, KrasServerHandler, KrasServerConnector } from '../types';

type Server = HttpServer | HttpsServer;

function findHook(hooks: Array<KrasServerHook>, req: Request) {
  let closest = undefined;
  let highscore = 0;

  for (const hook of hooks) {
    const score = hook.rate(req);

    if (score === 1) {
      return hook;
    } else if (score > highscore) {
      highscore = score;
      closest = hook;
    }
  }

  if (closest) {
    return closest;
  }
}

interface WebSocketConnection {
  getWss(target?: Array<string>): {
    clients: Array<{
      send(data: string): void;
    }>;
    close(): void;
  };
}

export class WebServer extends EventEmitter implements BaseKrasServer {
  private readonly app: Application & {
    ws?(target: string, connect: KrasServerConnector): void;
  };
  private readonly hooks: Array<KrasServerHook> = [];
  private readonly port: number;
  private readonly targets: Array<string>;
  private readonly server: Server;
  private sockets: WebSocketConnection;

  constructor(config: Partial<WebServerConfiguration> = {}) {
    super();
    const mapping = config.map || {};
    const ssl = readSsl(config.ssl);
    const keys = Object.keys(mapping);
    this.targets = keys.filter(key => mapping[key].match('^wss?://'));
    this.port = config.port || 9000;
    this.app = express();
    this.server = ssl ? createHttpsServer(ssl, this.app) : createHttpServer(this.app);
    this.ws = config.ws;
    this.app.use(text({ type: '*/*' }));
    this.targets.forEach(target => this.app.ws(target, (ws, req) => {
      const url = req.url.replace('/.websocket', '').substr(target.length);
      const id = Date.now() % 100000000;
      this.emit('user-connected', {
        id,
        ws,
        target,
        url,
      });
      ws.on('close', () => this.emit('user-disconnected', {
        id,
        ws,
        target,
        url,
      }));
      ws.on('message', (data: string) => this.emit('message', {
        id,
        target,
        url,
        data,
      }));
    }));
  }

  get ws() {
    const ws = this.sockets && this.sockets.getWss();
    return !!ws;
  }

  set ws(value: boolean) {
    const ws = this.sockets && this.sockets.getWss();

    if (!value && ws) {
      ws.close();
      this.sockets = undefined;
    } else if (!ws && value) {
      this.sockets = expressWs(this.app, this.server);
    }
  }

  add(hook: KrasServerHook) {
    if (Array.isArray(hook)) {
      this.hooks.push.apply(this.hooks, hook);
    } else if (typeof hook === 'object') {
      this.hooks.push(hook);
    }

    return this;
  }

  remove(hook: KrasServerHook) {
    const index = this.hooks.indexOf(hook);
    this.hooks.splice(index, 1);
    return this;
  }

  at(...segments: Array<string>) {
    const endpoint = segments.join('/');
    const app = this.app;
    const api: KrasServerMethods = {
      get(handler: KrasServerHandler) {
        app.get(endpoint, handler);
        return api;
      },
      put(handler: KrasServerHandler) {
        app.put(endpoint, handler);
        return api;
      },
      delete(handler: KrasServerHandler) {
        app.delete(endpoint, handler);
        return api;
      },
      post(handler: KrasServerHandler) {
        app.post(endpoint, handler);
        return api;
      },
      feed(handler: KrasServerConnector) {
        app.ws(endpoint, handler);
        return api;
      },
    };
    return api;
  }

  start() {
    this.app.all('*', (req: Request, res: Response) => {
      if (req.method !== 'OPTIONS') {
        const hook = findHook(this.hooks, req);

        if (!hook) {
          res.status(404);
          return res.end('Page could not be found.');
        }

        return hook.handle(req, res);
      }

      return corsHandler(req, res);
    });

    this.server.listen(this.port, () => {
      this.emit('open', {
        port: this.port,
      });
    });
  }

  stop() {
    this.emit('close');
    this.server.close();
  }

  broadcast<T>(msg: T) {
    const sockets = this.sockets;

    if (sockets) {
      const isObject = typeof msg === 'object';
      const data = isObject ? JSON.stringify(msg) : (msg || '').toString();
      this.emit('broadcast', { data });
      const socket = sockets.getWss(this.targets);

      if (socket) {
        const clients = socket.clients;
        clients.forEach(client => client.send(data));
      }
    }
  }
}
