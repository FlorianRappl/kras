import { homedir } from 'os';
import { resolve } from 'path';
import { MockServerCore } from './core';
import { withManagement } from './management';
import { withInjectors } from './injectors';
import { withFiles } from './helpers/files';
import { withMiddlewares } from './helpers/middlewares';
import { runWith, configureHandler } from './helpers/fluent';
import { currentDir } from './core/info';
import {
  KrasConfiguration,
  KrasServer,
  LogEntry,
  LogEntryType,
  LogLevel,
  KrasInjector,
  KrasServerMethods,
  KrasServerHandler,
  KrasHandlerConfiguration,
  KrasRunner,
  KrasMiddleware
} from './types';
import {
  buildConfiguration,
  mergeConfiguration,
  readConfiguration,
  ConfigurationOptions
} from './core/config';
export {
  KrasRequestHandler,
  KrasInjectorOptions,
  KrasInjectorOption,
  KrasInjectorConfig,
  KrasRequest,
  KrasResponse,
  KrasAnswer,
  Dict,
  Headers,
  ScriptResponseBuilder,
  ScriptResponseBuilderData
} from './types';
export {
  KrasInjector,
  KrasConfiguration,
  KrasServerMethods,
  KrasServerHandler,
  KrasHandlerConfiguration,
  KrasRunner
};

export type KrasRuntimeConfiguration = Partial<KrasConfiguration> &
  KrasHandlerConfiguration;

export const krasrc = '.krasrc';

function disposeInjector(injector: KrasInjector) {
  if (injector && typeof injector.dispose === 'function') {
    injector.dispose();
  }
}

export class MockServer extends MockServerCore implements KrasServer {
  readonly injectors: Array<KrasInjector> = [];
  readonly middlewares: Array<KrasMiddleware> = [];
  readonly logs: Array<LogEntry> = [];
  readonly logLevel: LogLevel;

  constructor(config: KrasConfiguration) {
    super(config);

    this.logLevel = config.logLevel || 'error';
    this.on('error', e => this.log('error', e));

    if (config.api === false) {
      this.recorder.disable();
    }

    withManagement(this, config);
    withInjectors(this, config);
    withMiddlewares(this, config);
    withFiles(this, config);
  }

  stop() {
    return super.stop().then(() => this.injectors.forEach(disposeInjector));
  }

  private log(type: LogEntryType, data: any) {
    const item: LogEntry = {
      type,
      data,
      time: new Date()
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
    readConfiguration(dir, file)
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

export function withKras(config?: KrasRuntimeConfiguration) {
  return (callback: KrasRunner) => {
    const server = buildKras(config);
    configureHandler(server, config);
    return runWith(server, callback);
  };
}

export function runWithKras(cb: KrasRunner, config?: KrasRuntimeConfiguration) {
  return withKras(config)(cb);
}
