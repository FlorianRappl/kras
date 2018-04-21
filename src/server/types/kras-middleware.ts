import { KrasServerHandler } from './kras-express';

export interface KrasMiddleware {
  source: string;
  options: Array<any>;
  active: boolean;
  handler: KrasServerHandler;
}

export interface KrasMiddlewareDefinition {
  source: string;
  options?: Array<any>;
}
