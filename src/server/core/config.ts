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

export function makePathsAbsolute(baseDir: string, config: ConfigurationFile) {
  if (config) {
    if (config.directory) {
      config.directory = resolve(baseDir, config.directory);
    }

    if (config.client) {
      config.client = resolve(baseDir, config.client);
    }

    if (config.injectors) {
      for (const name of Object.keys(config.injectors)) {
        const injector = config.injectors[name];

        if (injector.directory) {
          injector.directory = resolve(baseDir, injector.directory);
        }
      }
    }
  }
}

export function readConfiguration(dir: string, file: string): ConfigurationFile {
  if (file) {
    const p = resolve(dir, file);

    if (existsSync(p)) {
      const config = require(p);

      if (config) {
        makePathsAbsolute(dir, config);
        return config;
      }
    }
  }

  return {};
}

export function buildConfiguration(options: ConfigurationOptions, ...configs: Array<ConfigurationFile>): KrasConfiguration {
  const defaultConfig = {
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
  };

  makePathsAbsolute(options.dir, defaultConfig);
  return Object.assign(defaultConfig, ...configs);
}
