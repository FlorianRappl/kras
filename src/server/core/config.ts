import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { rootDir, name, version, currentDir } from '../info';
import { KrasConfiguration, LogLevel } from '../types';
import * as chalk from 'chalk';

export interface ConfigurationOptions {
  name?: string;
  port?: number;
  logs?: LogLevel;
  dir?: string;
  cert?: string;
  key?: string;
  skipApi?: boolean;
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
        const directory = injector.directory;

        if (typeof directory === 'string') {
          injector.directory = resolve(baseDir, directory);
        } else if (Array.isArray(directory)) {
          injector.directory = directory.map((dir) => resolve(baseDir, dir));
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
        const msg = `Error reading configuration from ${file} in ${dir}: ${e}`;
        throw new Error(`${chalk.red('ERR')} ${chalk.white(msg)}`);
      }
    }
  }

  return {};
}

export function mergeConfiguration(
  options?: ConfigurationOptions,
  ...configs: Array<ConfigurationFile>
): KrasConfiguration {
  const config: KrasConfiguration = Object.assign({}, ...configs);

  if (options) {
    if (options.cert !== undefined || options.key !== undefined) {
      config.ssl = {
        cert: options.cert || (config.ssl && config.ssl.cert),
        key: options.key || (config.ssl && config.ssl.key),
      };
    }

    if (options.skipApi) {
      config.api = false;
    }

    if (options.logs) {
      config.logLevel = options.logs;
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
  }

  return config;
}

export const defaultConfig = {
  name: `${name} v${version}`,
  port: 9000,
  directory: resolve(currentDir, 'mocks'),
  client: 'kras-management-portal',
  ssl: {
    cert: resolve(rootDir, 'cert', 'server.crt'),
    key: resolve(rootDir, 'cert', 'server.key'),
  },
  uploadLimit: parseInt(process.env.FILE_SIZE_LIMIT, 10) || 10, // default: 10 MB
  logLevel: 'error',
  api: '/manage',
  ws: true,
  map: {
    '': 'https://httpbin.org',
    '/api': 'https://jsonplaceholder.typicode.com',
    '/events': 'ws://demos.kaazing.com/echo',
  },
  auth: undefined,
  middlewares: [],
  injectors: {
    script: {
      active: true,
    },
    har: {
      active: true,
      delay: false,
    },
    json: {
      active: true,
      randomize: true,
    },
    proxy: {
      active: true,
    },
    store: {
      active: false,
    },
  },
} as KrasConfiguration;

export function buildConfiguration(config: Partial<ConfigurationFile> = {}): KrasConfiguration {
  const newConfig = Object.assign({}, defaultConfig, config);
  const newMap: Record<string, any> = {};

  Object.keys(newConfig.map || {}).forEach((oldKey) => {
    const newKey = oldKey.replace(/\/+$/, '');
    newMap[newKey] = newConfig.map[oldKey];
  });

  newConfig.map = newMap;
  return newConfig;
}
