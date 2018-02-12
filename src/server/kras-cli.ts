#!/usr/bin/env node

import chalk from 'chalk';
import { buildKras, readKrasConfig, krasrc } from './kras';
import { resolve } from 'path';
import { defaultConfig } from './core/config';
import { author, currentDir } from './core/info';

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .alias('c', 'config')
  .describe('c', `Sets the configuration file to use, by default ${krasrc}`)
  .number('p')
  .alias('p', 'port')
  .describe('p', `Sets the port of the server, by default ${defaultConfig.port}`)
  .string('n')
  .alias('n', 'name')
  .describe('n', `Sets the name of the server, by default ${defaultConfig.name}`)
  .string('d')
  .alias('d', 'dir')
  .describe('d', `Sets the base directory of the server, by default ${defaultConfig.directory}`)
  .string('cert')
  .describe('cert', `Sets the certificate of the server, by default ${defaultConfig.ssl.cert}`)
  .string('key')
  .describe('key', `Sets the key of the server, by default ${defaultConfig.ssl.key}`)
  .alias('l', 'log-level')
  .describe('l', `Sets the log level of the application, by default ${defaultConfig.logLevel}`)
  .choices('l', ['info', 'debug', 'error'])
  .version()
  .help('h')
  .alias('h', 'help')
  .describe('h', 'Shows the argument descriptions')
  .epilog(`Copyright (c) 2018 ${author}`)
  .argv;

function info(message: string) {
  return message && message.length > 50 ? (message.substr(0, 47) + ' ...') : message;
}

function isDebug(logLevel: string) {
  // level is debug, i.e., strongest level already
  return logLevel === 'debug';
}

function isInfo(logLevel: string) {
  // level is not error, i.e., at least info is given
  return server.logLevel !== 'error';
}

function isError(logLevel: string) {
  // no matter what the level is, the minimum level is always error
  return true;
}

const options = {
  port: argv.p,
  name: argv.n,
  logs: argv.l,
  cert: argv.cert,
  key: argv.key,
  dir: argv.d,
};

const config = readKrasConfig(options, argv.c !== krasrc && argv.c);
const server = buildKras(config);

server.on('open', svc => {
  console.log(`Server listening at port ${chalk.green(svc.port)}.`);
});

server.on('close', svc => {
  console.log(`Connection to server closed.`);
});

server.on('user-connected', msg => {
  if (isDebug(server.logLevel)) {
    console.log(`${chalk.green('WS')} + ${chalk.white(info(msg.id))}`);
  }
});

server.on('user-disconnected', msg => {
  if (isDebug(server.logLevel)) {
    console.log(`${chalk.green('WS')} - ${chalk.white(info(msg.id))}`);
  }
});

server.on('message', msg => {
  if (isDebug(server.logLevel)) {
    console.log(`${chalk.green('WS')} << ${chalk.white(info(msg.content))}`);
  }
});

server.on('broadcast', msg => {
  if (isInfo(server.logLevel)) {
    console.log(`${chalk.green('WS')} >> ${chalk.white(info(msg.content))}`);
  }
});

server.on('missing', req => {
  if (isError(server.logLevel)) {
    console.log(`${chalk.yellow(req.method)} ${chalk.gray(req.target)}${chalk.white(req.url)}`);
  }
});

server.on('request', req => {
  if (isDebug(server.logLevel)) {
    console.log(`${chalk.green(req.method)} ${chalk.gray(req.target)}${chalk.white(req.url)}`);
  }
});

server.on('error', msg => {
  if (isError(server.logLevel)) {
    console.log(`${chalk.red('ERR')} ${chalk.white(msg)}`);
  }
});

server.on('debug', msg => {
  if (isDebug(server.logLevel)) {
    console.log(`${chalk.yellow('DBG')} ${chalk.white(msg)}`);
  }
});

server.on('info', msg => {
  if (isInfo(server.logLevel)) {
    console.log(`${chalk.bgWhite(chalk.black('INF'))} ${chalk.white(msg)}`);
  }
});

server.start();
