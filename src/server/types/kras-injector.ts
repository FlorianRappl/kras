import type { KrasRequest } from './kras-request';
import type { Headers, Dict } from './kras-basics';
import type { KrasInjectorOptions } from './kras-injector-options';

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
  host?: {
    target: string;
    address: string;
  };
  file?: {
    name: string;
    entry?: number;
  };
}

export interface KrasInjectorConfig {
  /**
   * Determins if the injector is active.
   */
  active: boolean;
  /**
   * Optionally sets the targets to ignore.
   * Otherwise, no targets are ignored.
   */
  ignore?: Array<string>;
  /**
   * Optionally sets explicitly the targets to handle.
   * Otherwise, all targets are handled.
   */
  handle?: Array<string>;
  /**
   * Optionally sets the base dir of the injector, i.e.,
   * the directory where the injector could be found.
   */
  baseDir?: string;
  /**
   * Defines some additional configurations which are then
   * handled by the specific injector.
   */
  [config: string]: any;
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
  setup?(): void | Promise<void>;
}
