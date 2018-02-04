import { KrasRequest } from './kras-request';
import { Headers, Dict } from './kras-basics';
import { KrasInjectorOptions } from './kras-injector-options';

export interface KrasAnswer {
  headers: Headers;
  status: {
    code: number;
    text?: string;
  };
  url: string;
  redirectUrl?: string;
  content: string | Buffer;
  injector?: KrasInjectorInfo;
}

export interface KrasInjectorInfo {
  name?: string;
  file?: {
    name: string;
    entry?: number;
  };
}

export interface KrasInjectorConfig {
  active: boolean;
}

export type KrasResponse = Promise<KrasAnswer> | KrasAnswer | void;

export interface KrasRequestHandler {
  (req: KrasRequest): KrasResponse;
}

export interface KrasInjector {
  active: boolean;
  readonly name: string;
  readonly handle: KrasRequestHandler;
  getOptions(): KrasInjectorOptions;
  setOptions(options: Dict<any>): void;
}
