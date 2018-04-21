import * as readFile from 'send';
import { dirname } from 'path';
import { KrasServer, KrasConfiguration, KrasServerHandler, KrasMiddleware } from '../types';

interface RequestHandlerCreator {
  (...args: Array<any>): KrasServerHandler;
}

function findMiddleware(modulePath: string): RequestHandlerCreator {
  try {
    const middlewareCreator = require(modulePath);

    if (typeof middlewareCreator === 'function') {
      return middlewareCreator;
    }
  } catch (e) {}

  return undefined;
}

function createMiddleware(source: string, options: Array<any>) {
  const creator = findMiddleware(source);

  if (creator) {
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
    const middleware = createMiddleware(source, options);

    if (middleware) {
      server.middlewares.push(middleware);
    }
  }

  integrateMiddlewares(server);
};
