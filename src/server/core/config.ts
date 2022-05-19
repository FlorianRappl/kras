import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { rootDir, name, version, currentDir } from '../info';
import { Dict, KrasConfiguration, LogLevel } from '../types';
import * as chalk from 'chalk';

export interface ConfigurationOptions {
  name?: string;
  port?: number;
  logs?: LogLevel;
  dir?: string;
  cert?: string;
  key?: string;
  skipApi?: boolean;
  initial?: Partial<KrasConfiguration>;
  required?: Partial<KrasConfiguration>;
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
          injector.directory = directory.map(dir => resolve(baseDir, dir));
        }
      }
    }
  }
}

export function readConfiguration(path: string): ConfigurationFile {
  if (path && existsSync(path)) {
    const dir = dirname(path);

    try {
      const content = readFileSync(path, 'utf8');
      const config = JSON.parse(content);

      if (config) {
        makePathsAbsolute(dir, config);
        return config;
      }
    } catch (e) {
      const msg = `Error reading configuration from "${path}" in "${dir}": ${e}`;
      throw new Error(`${chalk.red('ERR')} ${chalk.white(msg)}`);
    }
  }

  return {};
}

function mergeObjects<T>(
  target: Partial<KrasConfiguration>,
  sources: Array<Partial<KrasConfiguration>>,
  select: (config: Partial<KrasConfiguration>) => Dict<T>,
) {
  const obj = select(target);

  for (const source of sources) {
    const value = select(source);

    if (value && typeof value === 'object') {
      Object.assign(obj, value);
    }
  }
}

function mergeArrays<T>(
  target: Partial<KrasConfiguration>,
  sources: Array<Partial<KrasConfiguration>>,
  select: (config: Partial<KrasConfiguration>) => Array<T>,
) {
  const arr = select(target);

  for (const source of sources) {
    const value = select(source);

    if (value && Array.isArray(value)) {
      arr.push(...value);
    }
  }
}

export function mergeConfiguration(
  options: ConfigurationOptions = {},
  ...configs: Array<ConfigurationFile>
): KrasConfiguration {
  const { initial = {}, required = {} } = options;
  const empty: Partial<KrasConfiguration> = {
    map: {},
    sources: [],
    injectors: {},
    middlewares: [],
  };
  const sources = [initial, ...configs, required, empty];
  const result: KrasConfiguration = Object.assign({}, ...sources);

  if (options.cert !== undefined || options.key !== undefined) {
    result.ssl = {
      cert: options.cert || (result.ssl && result.ssl.cert),
      key: options.key || (result.ssl && result.ssl.key),
    };
  }

  if (options.skipApi) {
    result.api = false;
  }

  if (options.logs) {
    result.logLevel = options.logs;
  }

  if (options.dir) {
    result.directory = options.dir;
  }

  if (options.name) {
    result.name = options.name;
  }

  if (options.port) {
    result.port = options.port;
  }

  mergeObjects(result, sources, m => m.injectors);
  mergeObjects(result, sources, m => m.map);
  mergeArrays(result, sources, m => m.sources);
  mergeArrays(result, sources, m => m.middlewares);

  return result;
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
  map: {},
  auth: undefined,
  middlewares: [],
  sources: [],
  injectors: {},
} as KrasConfiguration;

export function buildConfiguration(config: Partial<ConfigurationFile> = {}): KrasConfiguration {
  const newConfig = Object.assign({}, defaultConfig, config);
  const newMap: Record<string, any> = {};

  Object.keys(newConfig.map || {}).forEach(oldKey => {
    const newKey = oldKey.replace(/\/+$/, '');
    newMap[newKey] = newConfig.map[oldKey];
  });

  newConfig.map = newMap;
  return newConfig;
}
