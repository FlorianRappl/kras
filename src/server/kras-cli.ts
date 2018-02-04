#!/usr/bin/env node

import chalk from 'chalk';
import { MockServer } from './kras';
import { homedir } from 'os';
import { resolve } from 'path';
import { readConfiguration, buildConfiguration } from './core/config';

const cwdDir = process.cwd();
const rootDir = resolve(__dirname, '../..');
const packageInfo = require(resolve(rootDir, 'package.json'));
const krasrc = '.krasrc';
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .alias('c', 'config')
  .default('c', krasrc)
  .describe('c', 'Sets the configuration file to use')
  .number('p')
  .alias('p', 'port')
  .default('p', 9000)
  .describe('p', 'Sets the port of the server')
  .string('n')
  .alias('n', 'name')
  .default('n', `${packageInfo.name} v${packageInfo.version}`)
  .describe('n', 'Sets the name of the server')
  .string('d')
  .alias('d', 'dir')
  .default('d', cwdDir)
  .describe('d', 'Sets the base directory of the server')
  .string('cert')
  .default('cert', resolve(rootDir, 'cert', 'server.crt'))
  .describe('cert', 'Sets the certificate of the server')
  .string('key')
  .default('key', resolve(rootDir, 'cert', 'server.key'))
  .describe('key', 'Sets the key of the server')
  .version()
  .help('h')
  .alias('h', 'help')
  .describe('h', 'Shows the argument descriptions')
  .epilog(`Copyright (c) 2018 ${packageInfo.author}`)
  .argv;

function info(message: string) {
  return message && message.length > 50 ? (message.substr(0, 47) + ' ...') : message;
}

const dir = resolve(cwdDir, argv.d);
const options = {
  port: argv.p,
  name: argv.n,
  cert: argv.cert,
  key: argv.key,
  dir,
  client: resolve(rootDir, 'dist', 'client', 'index.html'),
};

const config = buildConfiguration(
  options,
  readConfiguration(homedir(), krasrc),
  readConfiguration(dir, krasrc),
  readConfiguration(dir, argv.c !== krasrc && argv.c),
);

const server = new MockServer(config);

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
