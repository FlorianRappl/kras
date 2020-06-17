import { Request, Response } from 'express';
import { resolve } from 'path';
import { spawn } from 'child_process';
import { KrasServer, KrasConfiguration } from '../types';

const started = new Date();

function start() {
  const [prog, ...args] = process.argv;
  const cwd = process.cwd();

  spawn(prog, args, {
    cwd,
    detached: true,
    stdio: 'inherit',
  }).unref();
}

function stop() {
  process.exit();
}

function restart() {
  process.on('exit', start);
  stop();
}

export function configOf(server: KrasServer, config: KrasConfiguration) {
  const pkgFile = resolve(__dirname, '..', '..', '..', 'package.json');
  const pkgInfo = require(pkgFile);
  return (_: Request, res: Response) => {
    res.json({
      directory: config.directory,
      sources: config.sources,
      map: config.map,
      name: config.name,
      version: pkgInfo.version,
      started: started.toString(),
      mode: 'running',
    });
  };
}

export function updateClient(server: KrasServer, config: KrasConfiguration) {
  return (req: Request, res: Response) => {
    const options = JSON.parse(req.body || '{}');

    switch (options.mode) {
      case 'restart':
        setTimeout(restart, 1000);
        break;
      case 'stop':
        setTimeout(stop, 1000);
        break;
      default:
        break;
    }

    res.sendStatus(200);
  };
}
