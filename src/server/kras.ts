import { homedir } from 'os';
import { resolve } from 'path';
import { MockServerCore } from './core';
import { withManagement } from './management';
import { withInjectors } from './injectors';
import { withFiles } from './helpers/files';
import { currentDir } from './core/info';
import { KrasConfiguration, KrasServer, LogEntry, LogEntryType, LogLevel, KrasInjector } from './types';
import { buildConfiguration, mergeConfiguration, readConfiguration, ConfigurationOptions } from './core/config';
export { KrasRequestHandler, KrasInjectorOptions, KrasInjectorOption, KrasRequest, KrasResponse, KrasAnswer } from './types';
export { KrasInjector };

export const krasrc = '.krasrc';

export class MockServer extends MockServerCore implements KrasServer {
  readonly injectors: Array<KrasInjector> = [];
  readonly logs: Array<LogEntry> = [];
  readonly logLevel: LogLevel;

  constructor(config: KrasConfiguration) {
    super(config);

    this.logLevel = config.logLevel || 'error';
    this.on('error', (e) => this.log('error', e));

    withManagement(this, config);
    withInjectors(this, config);
    withFiles(this, config);
  }

  private log(type: LogEntryType, data: any) {
    const item: LogEntry = {
      type,
      data,
      time: new Date(),
    };
    this.logs.push(item);
    this.emit('logged', item);
  }
}

export function readKrasConfig(options?: ConfigurationOptions, file?: string) {
  const dir = options.dir ? resolve(currentDir, options.dir) : currentDir;
  return mergeConfiguration(
    options,
    readConfiguration(homedir(), krasrc),
    readConfiguration(dir, krasrc),
    readConfiguration(dir, file),
  );
}

export function buildKras(config?: Partial<KrasConfiguration>) {
  return new MockServer(buildConfiguration(config));
}

export function runKras(config?: Partial<KrasConfiguration>) {
  const server = buildKras(config);
  server.start();
  return server;
}
