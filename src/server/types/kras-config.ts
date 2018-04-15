import { SslConfiguration, LogLevel } from './kras-basics';
import { KrasInjectorConfig } from './kras-injector';

export interface AppConfiguration {
  logLevel: LogLevel;
}

export interface WebServerConfiguration extends AppConfiguration {
  map: {
    [target: string]: string;
  };
  ssl: SslConfiguration;
  ws: boolean;
  port: number;
}

export interface KrasConfiguration extends WebServerConfiguration {
  name: string;
  client: string;
  directory: string;
  api: string | false;
  injectors: {
    [name: string]: KrasInjectorConfig;
  };
}
