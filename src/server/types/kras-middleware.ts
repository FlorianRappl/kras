import type { KrasServerHandler } from './kras-express';

export interface KrasMiddleware {
  source: string;
  direction: 'in' | 'out';
  options: Array<any>;
  active: boolean;
  handler: KrasServerHandler;
}

export interface KrasMiddlewareDefinition {
  source: string;
  direction?: 'in' | 'out';
  baseDir?: string;
  options?: Array<any>;
}
