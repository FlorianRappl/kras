import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { KrasConfiguration } from '../types';
import { rootDir, name, version, currentDir } from './info';

export interface ConfigurationOptions {
  name: string;
  port: number;
  dir: string;
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
      try {
        const content = readFileSync(p, 'utf8');
        const config = JSON.parse(content);

        if (config) {
          makePathsAbsolute(dir, config);
          return config;
        }
      } catch (e) {
        console.error(`Error reading configuration from ${file} in ${dir}: ${e}`);
      }
    }
  }

  return {};
}

export function mergeConfiguration(options: ConfigurationOptions, ...configs: Array<ConfigurationFile>): KrasConfiguration {
  const config: KrasConfiguration = Object.assign({}, ...configs);

  if (options.cert !== undefined || options.key !== undefined) {
    config.ssl = {
      cert: options.cert || (config.ssl && config.ssl.cert),
      key: options.key || (config.ssl && config.ssl.key),
    };
  }

  if (options.dir) {
    config.directory = options.dir;
  }

  if (options.name) {
    config.name = options.name;
  }

  if (options.port) {
    config.port = options.port;
  }

  return config;
}

export const defaultConfig = {
  name: `${name} v${version}`,
  port: 9000,
  directory: currentDir,
  client: resolve(rootDir, 'dist', 'client', 'index.html'),
  ssl: {
    cert: resolve(rootDir, 'cert', 'server.crt'),
    key: resolve(rootDir, 'cert', 'server.key'),
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
      directory: resolve(currentDir, './db/'),
    },
    'har': {
      active: true,
      directory: resolve(currentDir, './db/'),
      delay: false,
    },
    'json': {
      active: true,
      directory: resolve(currentDir, './db/'),
    },
    'proxy': {
      active: true,
    },
    'store': {
      active: false,
      directory: resolve(currentDir, './db/'),
    }
  }
} as KrasConfiguration;

export function buildConfiguration(config: Partial<ConfigurationFile> = {}): KrasConfiguration {
  return Object.assign(defaultConfig, config);
}
