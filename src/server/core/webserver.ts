import * as express from 'express';
import * as expressWs from 'express-ws';
import type { Server as WebSocketServer } from 'ws';
import { Application, Request, Response } from 'express';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https';
import { text } from 'body-parser';
import * as multer from 'multer';
import { EventEmitter } from 'events';
import { readSsl } from './readSsl';
import { corsHandler } from './proxy';
import {
  WebServerConfiguration,
  KrasServerHook,
  BaseKrasServer,
  KrasServerMethods,
  KrasServerHandler,
  KrasServerConnector,
  Dict,
} from '../types';

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
    clients: Set<{
      send(data: string): void;
    }>;
    close(): void;
  };
}

function getWsTargets(mapping: Dict<string | boolean>) {
  const keys = Object.keys(mapping);

  if (keys.length) {
    const targets = keys.filter((key) => {
      const address = mapping[key];

      if (typeof address === 'string') {
        return address.match('^wss?://');
      }

      return address;
    });

    if (targets.length) {
      return targets;
    }
  }

  return ['*'];
}

export class WebServer extends EventEmitter implements BaseKrasServer {
  private readonly app: Application & {
    ws?(target: string, connect: KrasServerConnector): void;
  };
  private readonly hooks: Array<KrasServerHook> = [];
  private readonly routes: Array<string> = [];
  private readonly port: number;
  private readonly protocol: string;
  private readonly targets: Array<string>;
  private readonly server: Server;
  private readonly wsOptions: Dict<any>;
  private sockets: WebSocketConnection;

  constructor(config: Partial<WebServerConfiguration> = {}) {
    super();
    const mapping = config.map || {};
    const ssl = readSsl(config.ssl);
    this.targets = getWsTargets(mapping);
    this.port = config.port || 9000;
    this.app = express();
    this.protocol = ssl ? 'https' : 'http';
    this.server = ssl ? createHttpsServer(ssl, this.app) : createHttpServer(this.app);
    this.wsOptions = typeof config.ws === 'object' ? config.ws : undefined;
    this.ws = !!config.ws;
    const sizeInMB = typeof config.uploadLimit === 'number' ? config.uploadLimit : 10;
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { files: 5, fileSize: sizeInMB * 1024 * 1024 },
    });
    this.app.use(upload.any());
    this.app.use(
      text({
        type: (req: any) => {
          return !(req.headers['content-type'] && req.headers['content-type'].search('multipart/form-data') !== -1);
        },
        limit: '50mb',
      }),
    );
    this.targets.forEach((target) =>
      this.app.ws(target, (ws, req) => {
        const url = req.url.replace('/.websocket', '').substr(target.length);
        const id = Date.now() % 100000000;
        this.emit('user-connected', {
          id,
          ws,
          target,
          url,
          req,
        });
        ws.on('close', () =>
          this.emit('user-disconnected', {
            id,
            ws,
            target,
            url,
            req,
          }),
        );
      }),
    );
  }

  get ws() {
    const ws = this.sockets && this.sockets.getWss();
    return !!ws;
  }

  set ws(value: boolean) {
    const ws = this.sockets && this.sockets.getWss();

    if (!value && ws) {
      this.emit('info', 'Turned off WebSocket support');
      ws.close();
      this.sockets = undefined;
    } else if (!ws && value) {
      this.emit('info', 'Turned on WebSocket support');
      this.sockets = expressWs(this.app, this.server, {
        wsOptions: this.wsOptions,
      });
      const wsServer = this.sockets.getWss() as WebSocketServer;
      wsServer.on('connection', (socket) => {
        socket.on('error', (err) => {
          this.emit('error', `Problem with the WS socket connection: ${err}`);
        });
      });
      wsServer.on('error', (err) => {
        this.emit('error', `Error with WS server: ${err}`);
      });
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
      any(handler: KrasServerHandler) {
        app.all(endpoint, handler);
        return api;
      },
      feed(handler: KrasServerConnector) {
        app.ws(endpoint, handler);
        return api;
      },
    };
    this.routes.push(endpoint);
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

      this.emit('debug', `Handled CORS request to ${req.url}`);
      return corsHandler(req, res);
    });

    return new Promise<void>((resolve) => {
      this.server.listen(this.port, () => {
        this.emit('open', {
          port: this.port,
          protocol: this.protocol,
          routes: this.routes,
        });
        resolve();
      });
    });
  }

  stop() {
    this.emit('close');
    return new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  broadcast<T>(msg: T) {
    const sockets = this.sockets;

    if (sockets) {
      const isObject = typeof msg === 'object';
      const data = isObject ? JSON.stringify(msg) : (msg || '').toString();
      const targets = this.targets;
      const wst = targets.length !== 1 || targets[0] !== '*' ? targets : undefined;
      this.emit('broadcast', { content: data, from: 'kras', to: '*', remote: false });
      const socket = sockets.getWss(wst);

      if (socket) {
        const clients = socket.clients;
        this.emit('debug', `Broadcasting to ${clients.size} client(s)`);
        clients.forEach((client) => client.send(data));
      }
    }
  }
}
