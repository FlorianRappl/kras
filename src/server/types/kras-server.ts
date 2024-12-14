import type { EventEmitter } from 'events';
import type { KrasInjector } from './kras-injector';
import type { KrasMiddleware } from './kras-middleware';
import type { KrasRecorder } from './kras-recorder';
import type { LogEntry, LogLevel } from './kras-basics';
import type { KrasServerHandler, KrasServerConnector, KrasServerHook } from './kras-express';

export interface KrasServerMethods {
  get(handler: KrasServerHandler): KrasServerMethods;
  put(handler: KrasServerHandler): KrasServerMethods;
  post(handler: KrasServerHandler): KrasServerMethods;
  delete(handler: KrasServerHandler): KrasServerMethods;
  any(handler: KrasServerHandler): KrasServerMethods;
  feed(handler: KrasServerConnector): KrasServerMethods;
}

export interface BaseKrasServer extends EventEmitter {
  add(hook: KrasServerHook): void;
  remove(hook: KrasServerHook): void;
  at(...segments: Array<string>): KrasServerMethods;
  broadcast<T>(msg: T): void;
  ws: boolean;
}

export interface KrasServer extends BaseKrasServer {
  readonly injectors: Array<KrasInjector>;
  readonly middlewares: Array<KrasMiddleware>;
  readonly recorder: KrasRecorder;
  readonly logs: Array<LogEntry>;
  readonly logLevel: LogLevel;
}
