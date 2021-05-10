import * as chalk from 'chalk';
import { homedir } from 'os';
import { resolve } from 'path';
import { MockServerCore } from './core';
import { version, currentDir, krasrc } from './info';
import { buildConfiguration, mergeConfiguration, readConfiguration, ConfigurationOptions } from './core/config';
import { withInjectors } from './injectors';
import { withManagement } from './management';
import { withFiles, withMiddlewares, runWith, configureHandler } from './helpers';
import {
  KrasConfiguration,
  KrasServer,
  LogEntry,
  LogEntryType,
  LogLevel,
  KrasInjector,
  KrasRunner,
  KrasMiddleware,
  KrasHandlerConfiguration,
} from './types';

function info(message: string) {
  return message && message.length > 50 ? message.substr(0, 47) + ' ...' : message;
}

function isDebug(logLevel: string) {
  // level is debug, i.e., strongest level already
  return logLevel === 'debug';
}

function isInfo(logLevel: string) {
  // level is not error, i.e., at least info is given
  return logLevel !== 'error';
}

function isError(logLevel: string) {
  // no matter what the level is, the minimum level is always error
  return !!logLevel;
}

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
    this.on('error', (e) => this.log('error', e));

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
    readConfiguration(dir, file !== krasrc && file),
  );
}

export function buildKras(config?: Partial<KrasConfiguration>) {
  return new MockServer(buildConfiguration(config));
}

export function buildKrasWithCli(config: KrasConfiguration) {
  const server = buildKras(config);
  connectToCli(server, config.api !== false);
  return server;
}

export function runKras(config?: Partial<KrasConfiguration>) {
  const server = buildKras(config);
  server.start();
  return server;
}

export type KrasRuntimeConfiguration = Partial<KrasConfiguration> & KrasHandlerConfiguration;

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

export function connectToCli(server: MockServer, canManage = true) {
  server.on('open', (svc) => {
    const port = chalk.green(svc.port);
    const protocol = svc.protocol;
    const server = `${protocol}://localhost:${port}`;
    console.log(`Server listening at port ${port} (${protocol.toUpperCase()}).`);

    if (canManage) {
      const manage = svc.routes[0] || '/manage';
      console.log(`Management app: ${server}${manage}`);
    }
  });

  server.on('close', (svc) => {
    console.log(`Connection to server closed.`);
  });

  server.on('user-connected', (msg) => {
    if (isDebug(server.logLevel)) {
      console.log(`${chalk.green('WS')} + ${chalk.white(info(msg.id))}`);
    }
  });

  server.on('user-disconnected', (msg) => {
    if (isDebug(server.logLevel)) {
      console.log(`${chalk.green('WS')} - ${chalk.white(info(msg.id))}`);
    }
  });

  server.on('message', (msg) => {
    if (isDebug(server.logLevel)) {
      console.log(`${chalk.green('WS')} << ${chalk.white(info(msg.content))}`);
    }
  });

  server.on('broadcast', (msg) => {
    if (isInfo(server.logLevel)) {
      console.log(`${chalk.green('WS')} >> ${chalk.white(info(msg.content))}`);
    }
  });

  server.on('missing', (req) => {
    if (isError(server.logLevel)) {
      console.log(`${chalk.yellow(req.method)} ${chalk.gray(req.target)}${chalk.white(req.url)}`);
    }
  });

  server.on('request', (req) => {
    if (isDebug(server.logLevel)) {
      console.log(`${chalk.green(req.method)} ${chalk.gray(req.target)}${chalk.white(req.url)}`);
    }
  });

  server.on('error', (msg) => {
    if (isError(server.logLevel)) {
      console.log(`${chalk.red('ERR')} ${chalk.white(msg)}`);
    }
  });

  server.on('debug', (msg) => {
    if (isDebug(server.logLevel)) {
      console.log(`${chalk.yellow('DBG')} ${chalk.white(msg)}`);
    }
  });

  server.on('info', (msg) => {
    if (isInfo(server.logLevel)) {
      console.log(`${chalk.bgWhite(chalk.black('INF'))} ${chalk.white(msg)}`);
    }
  });
}

export function runFromCli(options: ConfigurationOptions, rcfile: string) {
  const config = readKrasConfig(options, rcfile);
  const server = buildKrasWithCli(config);
  console.log(`Starting kras v${version} ...`);
  server.start();
  return server;
}
