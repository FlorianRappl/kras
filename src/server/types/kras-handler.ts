import { KrasServerMethods } from './kras-server';
import { KrasServerHandler } from './kras-express';

export interface KrasHandlerConfiguration {
  handlers?: {
    [url: string]: KrasServerHandler;
  };
}

export interface KrasConfigurator {
  at(url: string): KrasServerMethods;
}

export interface KrasRunner {
  (s: KrasConfigurator): Promise<void> | void;
}
