import { resolve } from 'path';
import { KrasServer, KrasConfiguration, KrasServerHandler } from '../types';

interface RequestHandlerCreator {
  (...args: Array<any>): KrasServerHandler;
}

interface RequestHandlerInitializer {
  setup?(server: KrasServer, config: KrasConfiguration): void;
}

function findMiddleware(modulePath: string): RequestHandlerCreator | RequestHandlerInitializer {
  try {
    return require(modulePath);
  } catch (e) {
    return undefined;
  }
}

function createMiddleware(server: KrasServer, config: KrasConfiguration, source: string, options: Array<any>) {
  const creator =
    findMiddleware(source) ||
    findMiddleware(resolve(config.directory, source)) ||
    findMiddleware(resolve(process.cwd(), source)) ||
    findMiddleware(resolve(__dirname, source));

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
  } else if (creator && typeof creator.setup === 'function') {
    creator.setup(server, config);
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
    const options = definition.options || [];
    const middleware = createMiddleware(server, config, source, options);

    if (middleware) {
      server.middlewares.push(middleware);
    }
  }

  integrateMiddlewares(server);
}
