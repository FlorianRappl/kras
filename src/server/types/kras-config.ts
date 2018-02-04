import { SslConfiguration } from './kras-basics';
import { KrasInjectorConfig } from './kras-injector';

export interface WebServerConfiguration {
  map: {
    [target: string]: string;
  };
  ssl: SslConfiguration;
  port: number;
}

export interface KrasConfiguration extends WebServerConfiguration {
  name: string;
  client: string;
  directory: string;
  api: string;
  injectors: {
    [name: string]: KrasInjectorConfig;
  };
}
