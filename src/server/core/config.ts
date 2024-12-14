import chalk from 'chalk';
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { name, version, currentDir, rootDir } from '../info';
import { deepMerge } from '../helpers';
import { Dict, KrasConfiguration, LogLevel } from '../types';

export interface ConfigurationOptions {
  name?: string;
  host?: string;
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
        const localDir = injector.baseDir;

        if (typeof directory === 'string') {
          injector.directory = resolve(baseDir, directory);
        } else if (Array.isArray(directory)) {
          injector.directory = directory.map((dir) => resolve(baseDir, dir));
        }

        if (typeof localDir === 'string') {
          injector.baseDir = resolve(baseDir, localDir);
        } else {
          injector.baseDir = baseDir;
        }
      }
    }

    if (Array.isArray(config.middlewares)) {
      for (const middleware of config.middlewares) {
        const localDir = middleware.baseDir;

        if (typeof localDir === 'string') {
          middleware.baseDir = resolve(baseDir, localDir);
        } else {
          middleware.baseDir = baseDir;
        }
      }
    }

    if (Array.isArray(config.sources)) {
      config.sources = config.sources.map((dir) => resolve(baseDir, dir));
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
  sources: Array<Partial<KrasConfiguration>>,
  select: (config: Partial<KrasConfiguration>) => Dict<T>,
) {
  const obj: Dict<T> = {};

  for (const source of sources) {
    const value = select(source);

    if (value && typeof value === 'object') {
      deepMerge(obj, value);
    }
  }

  return obj;
}

function mergeArrays<T>(
  sources: Array<Partial<KrasConfiguration>>,
  select: (config: Partial<KrasConfiguration>) => Array<T>,
  compare: (item1: T, item2: T) => boolean,
) {
  const arr: Array<T> = [];

  for (const source of sources) {
    const value = select(source);

    if (value && Array.isArray(value)) {
      for (let i = arr.length; i--; ) {
        const a = arr[i];

        for (const b of value) {
          if (compare(a, b)) {
            arr.splice(i, 1);
          }
        }
      }

      arr.push(...value);
    }
  }

  return arr;
}

export function mergeConfiguration(
  options: ConfigurationOptions = {},
  ...configs: Array<ConfigurationFile>
): KrasConfiguration {
  const { initial = {}, required = {} } = options;
  const sources = [initial, ...configs, required];
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

  if (options.host) {
    result.host = options.host;
  }

  result.injectors = mergeObjects(sources, (m) => m.injectors);
  result.map = mergeObjects(sources, (m) => m.map);
  result.sources = mergeArrays(
    sources,
    (m) => m.sources,
    (a, b) => a === b,
  );
  result.injectorDirs = mergeArrays(
    sources,
    (m) => m.injectorDirs,
    (a, b) => a === b,
  );
  result.middlewares = mergeArrays(
    sources,
    (m) => m.middlewares,
    (a, b) => a.source === b.source,
  );

  return result;
}

const certDir = resolve(rootDir, 'cert');

export const defaultConfig = {
  name: `${name} v${version}`,
  host: '0.0.0.0',
  port: 9000,
  directory: resolve(currentDir, 'mocks'),
  client: 'kras-management-portal',
  ssl: {
    cert: resolve(certDir, 'server.crt'),
    key: resolve(certDir, 'server.key'),
  },
  uploadLimit: parseInt(process.env.FILE_SIZE_LIMIT, 10) || 10, // default: 10 MB
  logLevel: 'error',
  api: '/manage',
  ws: true,
  map: {},
  auth: undefined,
  middlewares: [],
  injectorDirs: [],
  sources: [],
  injectors: {},
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
