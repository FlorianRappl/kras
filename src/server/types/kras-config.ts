import { SslConfiguration, LogLevel, Dict } from './kras-basics';
import { KrasInjectorConfig } from './kras-injector';
import { KrasMiddlewareDefinition } from './kras-middleware';

export interface AppConfiguration {
  logLevel: LogLevel;
}

export interface WebServerConfigurationMap {
  [target: string]: string | boolean;
}

export interface WebServerConfiguration extends AppConfiguration {
  map: WebServerConfigurationMap;
  ssl: SslConfiguration;
  ws: boolean | Dict<any>;
  uploadLimit: number;
  port: number;
}

export interface KrasAuthSimpleAccount {
  username: string;
  password: string;
}

export interface KrasAuth {
  provider: 'simple';
  accounts: Array<KrasAuthSimpleAccount>;
}

export interface KrasConfigurationInjectors {
  [name: string]: KrasInjectorConfig;
}

export interface KrasConfiguration extends WebServerConfiguration {
  name: string;
  client: string;
  directory: string;
  sources?: Array<string>;
  api: string | false;
  auth: undefined | KrasAuth;
  middlewares: Array<KrasMiddlewareDefinition>;
  injectors: KrasConfigurationInjectors;
}
