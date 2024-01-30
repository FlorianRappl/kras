import { resolve } from 'path';
import { rootDir } from '../info';
import { KrasServer, KrasConfiguration, KrasServerHandler } from '../types';

interface MiddlewarePackage {
  (...args: Array<any>): KrasServerHandler | Promise<KrasServerHandler>;
  setup?(server: KrasServer, config: KrasConfiguration): void | Promise<void>;
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

async function createMiddleware(
  server: KrasServer,
  config: KrasConfiguration,
  baseDir: string,
  source: string,
  direction: 'in' | 'out',
  options: Array<any>,
) {
  const creator =
    findFirstMiddleware([source, resolve(baseDir, source)]) ||
    findFirstMiddleware((config.sources || []).map((dir) => resolve(dir, source))) ||
    findFirstMiddleware([resolve(process.cwd(), source), resolve(rootDir, source)]);

  if (creator) {
    if (typeof creator.setup === 'function') {
      await creator.setup(server, config);
    }

    if (typeof creator === 'function') {
      const handler = await creator(...options);

      if (typeof handler === 'function') {
        return {
          options,
          source,
          active: true,
          direction,
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
      all.any((req, res, next) => {
        if (middleware.active) {
          if (middleware.direction === 'in') {
            return middleware.handler(req, res, next);
          } else if (middleware.direction === 'out') {
            res.middlewares.push(
              () =>
                new Promise<any>((resolve, reject) => {
                  try {
                    middleware.handler(req, res, resolve);
                  } catch (e) {
                    reject(e);
                  }
                }),
            );
            return next();
          }
        }

        next();
      });
    }
  }
}

export async function withMiddlewares(server: KrasServer, config: KrasConfiguration) {
  const middlewareDefinitions = config.middlewares || [];

  for (const definition of middlewareDefinitions) {
    const source = definition.source;
    const baseDir = definition.baseDir || config.directory;
    const options = definition.options || [];
    const direction = definition.direction || 'in';
    const middleware = await createMiddleware(server, config, baseDir, source, direction, options);

    if (middleware) {
      server.middlewares.push(middleware);
    }
  }

  integrateMiddlewares(server);
}
