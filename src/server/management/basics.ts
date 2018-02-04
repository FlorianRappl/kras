import { Request, Response } from 'express';
import { KrasServer, KrasConfiguration } from '../types';
import { resolve } from 'path';

export function configOf(server: KrasServer, config: KrasConfiguration) {
  const pkgFile = resolve(__dirname, '..', '..', '..', 'package.json');
  const pkgInfo = require(pkgFile);
  return (req: Request, res: Response) => {
    res.json({
      directory: config.directory,
      map: config.map,
      name: config.name,
      version: pkgInfo.version,
    });
  };
}
