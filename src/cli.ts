#!/usr/bin/env node

import * as yargs from 'yargs';
import { runFromCli, defaultConfig, author, krasrc, LogLevel } from './server';

const argv = yargs
  .usage('Usage: $0 [options]')
  .string('c')
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
  .string('host')
  .describe('host', `Sets the host binding of the server, by default ${defaultConfig.host}`)
  .string('cert')
  .describe('cert', `Sets the certificate of the server, by default ${defaultConfig.ssl.cert}`)
  .string('key')
  .describe('key', `Sets the key of the server, by default ${defaultConfig.ssl.key}`)
  .alias('l', 'log-level')
  .describe('l', `Sets the log level of the application, by default ${defaultConfig.logLevel}`)
  .choices('l', ['info', 'debug', 'error'])
  .boolean('skip-api')
  .describe('skip-api', 'If set avoids creating the management API endpoint')
  .option('map', {})
  .describe('map', 'Sets the different mappings, e.g., "--map./=https://httpbin.org"; can be used multiple times')
  .default('map', {})
  .version()
  .help('h')
  .alias('h', 'help')
  .describe('h', 'Shows the argument descriptions')
  .epilog(`Copyright (c) 2018 - 2022 ${author}`).argv;

runFromCli(
  {
    port: argv.p,
    host: argv.host,
    name: argv.n,
    logs: argv.l as LogLevel,
    cert: argv.cert,
    key: argv.key,
    dir: argv.d,
    skipApi: argv['skip-api'],
    initial: {
      map: argv.map,
      injectorDirs: [argv.d, process.cwd()],
      injectors: {
        script: {
          active: true,
        },
        har: {
          active: true,
          delay: false,
        },
        json: {
          active: true,
          randomize: true,
        },
        proxy: {
          active: true,
        },
        store: {
          active: false,
        },
      },
    },
  },
  argv.c,
).catch((err) => {
  console.error(err);
  process.exit(1);
});
