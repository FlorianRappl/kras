import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

export interface KrasServerHook {
  handle(req: Request, res: Response): void;
  rate(req: Request): number;
}

export interface KrasServerHandler {
  (req: Request, res: Response, next?: NextFunction): void;
}

export type KrasWebSocket = EventEmitter & {
  send(msg: string): void;
  close(): void;
};

export interface KrasServerConnector {
  (ws: KrasWebSocket, req: Request): void;
}
