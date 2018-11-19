import { KrasServer, KrasHandlerConfiguration, KrasRunner } from '../types';

export function configureHandler(server: KrasServer, config?: KrasHandlerConfiguration) {
  const handlers = config && config.handlers;

  if (handlers) {
    for (const url of Object.keys(handlers)) {
      const handler = handlers[url];
      server.at(url).any(handler);
    }
  }
}

export interface FullKrasServer extends KrasServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function runWith(server: FullKrasServer, callback: KrasRunner) {
  return server
    .start()
    .then(() => callback(server))
    .then(() => server.stop());
}
