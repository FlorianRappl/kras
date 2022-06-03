import { resolve } from 'path';
import { KrasServer, KrasConfiguration, KrasServerHandler } from '../types';

interface MiddlewarePackage {
  (...args: Array<any>): KrasServerHandler;
  setup?(server: KrasServer, config: KrasConfiguration): void;
}

function findMiddleware(modulePath: string): MiddlewarePackage {
  try {
    return require(modulePath);
  } catch (e) {
    return undefined;
  }
}

function findFirstMiddleware(paths: Array<string>) {
  for (const path of paths) {
    const creator = findMiddleware(path);

    if (creator) {
      return creator;
    }
  }

  return undefined;
}

function createMiddleware(
  server: KrasServer,
  config: KrasConfiguration,
  baseDir: string,
  source: string,
  options: Array<any>,
) {
  const creator =
    findFirstMiddleware([source, resolve(baseDir, source)]) ||
    findFirstMiddleware((config.sources || []).map((dir) => resolve(dir, source))) ||
    findFirstMiddleware([resolve(process.cwd(), source), resolve(__dirname, source)]);

  if (creator) {
    if (typeof creator.setup === 'function') {
      creator.setup(server, config);
    }

    if (typeof creator === 'function') {
      const handler = creator(...options);

      if (typeof handler === 'function') {
        return {
          options,
          source,
          active: true,
          handler,
        };
      }
    }
  }

  return undefined;
}

function integrateMiddlewares(server: KrasServer) {
  if (server.middlewares.length) {
    const all = server.at('*');

    for (const middleware of server.middlewares) {
      all.any(middleware.handler);
    }
  }
}

export function withMiddlewares(server: KrasServer, config: KrasConfiguration) {
  const middlewareDefinitions = config.middlewares || [];

  for (const definition of middlewareDefinitions) {
    const source = definition.source;
    const baseDir = definition.baseDir || config.directory;
    const options = definition.options || [];
    const middleware = createMiddleware(server, config, baseDir, source, options);

    if (middleware) {
      server.middlewares.push(middleware);
    }
  }

  integrateMiddlewares(server);
}
