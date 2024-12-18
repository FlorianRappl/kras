import type { Request, Response, NextFunction } from 'express';
import type { EventEmitter } from 'events';
import type { Data } from 'ws';

declare global {
  namespace Express {
    interface Request {
      addedHeaders: Record<string, string | Array<string>>;
      removedHeaders: Array<string>;
      addedQuery: Record<string, string | Array<string>>;
      removedQuery: Array<string>;
    }

    interface Response {
      middlewares: Array<() => Promise<void>>;
      prepared: any;
    }
  }
}

export interface KrasServerHook {
  handle(req: Request, res: Response): void;
  rate(req: Request): number;
}

export interface KrasServerHandler {
  (req: Request, res: Response, next?: NextFunction): void;
}

export type KrasWebSocket = EventEmitter & {
  protocol: string;
  send(msg: Data, onError?: (err: Error) => void): void;
  close(): void;
};

export interface KrasServerConnector {
  (ws: KrasWebSocket, req: Request): void;
}

export interface KrasWebSocketEvent {
  id: string;
  ws: KrasWebSocket;
  target: string;
  url: string;
  req: Request;
  handled?: boolean;
}
