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
  ignore?: Array<string>;
}

export type KrasResult = KrasAnswer | void;

export type KrasResponse = Promise<KrasResult> | KrasResult;

export interface KrasRequestHandler {
  (req: KrasRequest): KrasResponse;
}

export interface KrasInjector {
  active: boolean;
  config: KrasInjectorConfig;
  readonly name: string;
  readonly handle: KrasRequestHandler;
  getOptions(): KrasInjectorOptions;
  setOptions(options: Dict<any>): void;
  dispose?(): void;
}
