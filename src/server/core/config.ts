import { resolve } from 'path';
import { existsSync } from 'fs';
import { KrasConfiguration } from '../types';

export interface ConfigurationOptions {
  name: string;
  port: number;
  dir: string;
  client: string;
  cert: string;
  key: string;
}

export interface ConfigurationFile {
  [key: string]: any;
}

export function readConfiguration(dir: string, file: string): ConfigurationFile {
  if (file) {
    const p = resolve(dir, file);

    if (existsSync(p)) {
      return require(p);
    }
  }

  return {};
}

export function buildConfiguration(options: ConfigurationOptions, ...configs: Array<ConfigurationFile>): KrasConfiguration {
  return Object.assign({
    name: options.name,
    port: options.port,
    directory: options.dir,
    client: options.client,
    ssl: {
      cert: options.cert,
      key: options.key,
    },
    api: '/manage',
    map: {
      '/': 'https://httpbin.org',
      '/api': 'https://jsonplaceholder.typicode.com',
      '/events': 'ws://demos.kaazing.com/echo',
    },
    injectors: {
      'script': {
        active: true,
        directory: './db/',
      },
      'har': {
        active: true,
        directory: './db/',
        delay: false,
      },
      'json': {
        active: true,
        directory: './db/',
      },
      'proxy': {
        active: true,
      },
      'store': {
        active: false,
        directory: './db/',
      }
    }
  }, ...configs);
}
