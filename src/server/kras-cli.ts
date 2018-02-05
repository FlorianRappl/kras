#!/usr/bin/env node

import chalk from 'chalk';
import { buildKras } from './kras';
import { homedir } from 'os';
import { resolve } from 'path';
import { readConfiguration, mergeConfiguration, defaultConfig } from './core/config';
import { author, currentDir } from './core/info';

const krasrc = '.krasrc';
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
  .version()
  .help('h')
  .alias('h', 'help')
  .describe('h', 'Shows the argument descriptions')
  .epilog(`Copyright (c) 2018 ${author}`)
  .argv;

function info(message: string) {
  return message && message.length > 50 ? (message.substr(0, 47) + ' ...') : message;
}

const dir = argv.d ? resolve(currentDir, argv.d) : currentDir;
const options = {
  port: argv.p,
  name: argv.n,
  cert: argv.cert,
  key: argv.key,
  dir: argv.d,
};

const config = mergeConfiguration(
  options,
  readConfiguration(homedir(), krasrc),
  readConfiguration(dir, krasrc),
  readConfiguration(dir, argv.c !== krasrc && argv.c),
);

const server = buildKras(config);

server.on('message', msg => {
  console.log(`${chalk.green('WS')} << ${chalk.white(info(msg.data))}`);
});

server.on('user-connected', msg => {
  console.log(`${chalk.green('WS')} + ${chalk.white(info(msg.id))}`);
});

server.on('user-disconnected', msg => {
  console.log(`${chalk.green('WS')} - ${chalk.white(info(msg.id))}`);
});

server.on('open', svc => {
  console.log(`Server listening at port ${chalk.green(svc.port)}.`);
});

server.on('close', svc => {
  console.log(`Connection to server closed.`);
});

server.on('broadcast', msg => {
  console.log(`${chalk.green('WS')} >> ${chalk.white(info(msg.data))}`);
});

server.on('error', err => {
  console.log(`${chalk.red('ERR')} ${chalk.white(err)}`);
});

server.on('missing', req => {
  console.log(`${chalk.yellow(req.method)} ${chalk.gray(req.target)}${chalk.white(req.url)}`);
});

server.on('request', req => {
  console.log(`${chalk.green(req.method)} ${chalk.gray(req.target)}${chalk.white(req.url)}`);
});

server.start();
