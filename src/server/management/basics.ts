import { Request, Response } from 'express';
import { KrasServer, KrasConfiguration } from '../types';
import { readConfiguration } from '../core/config';
import { resolve } from 'path';

export function configOf(server: KrasServer, config: KrasConfiguration) {
  const rootDir = resolve(__dirname, '..', '..', '..');
  const pkgInfo = readConfiguration(rootDir, 'package.json');
  return (req: Request, res: Response) => {
    res.json({
      directory: config.directory,
      map: config.map,
      name: config.name,
      version: pkgInfo.version,
    });
  };
}
