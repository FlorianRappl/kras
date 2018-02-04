import { MockServerCore } from './core';
import { withManagement } from './management';
import { withInjectors } from './injectors';
import { withFiles } from './helpers/files';
import { KrasConfiguration, KrasServer, KrasInjector } from './types';

export class MockServer extends MockServerCore implements KrasServer {
  readonly injectors: Array<KrasInjector> = [];

  constructor(config?: KrasConfiguration) {
    super(config);

    withManagement(this, config);
    withInjectors(this, config);
    withFiles(this, config);
  }
}

export function runKras(config?: KrasConfiguration) {
  const server = new MockServer(config);
  server.start();
  return server;
}
