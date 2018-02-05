import { MockServerCore } from './core';
import { withManagement } from './management';
import { withInjectors } from './injectors';
import { withFiles } from './helpers/files';
import { KrasConfiguration, KrasServer, KrasInjector } from './types';
import { buildConfiguration } from './core/config';

export class MockServer extends MockServerCore implements KrasServer {
  readonly injectors: Array<KrasInjector> = [];

  constructor(config: KrasConfiguration) {
    super(config);

    withManagement(this, config);
    withInjectors(this, config);
    withFiles(this, config);
  }
}

export function buildKras(config?: Partial<KrasConfiguration>) {
  return new MockServer(buildConfiguration(config));
}

export function runKras(config?: Partial<KrasConfiguration>) {
  const server = buildKras(config);
  server.start();
  return server;
}
