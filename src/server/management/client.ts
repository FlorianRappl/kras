import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { Request, Response } from 'express';
import { KrasConfiguration, KrasServer } from '../types';

function getClient(cwd: string, path: string) {
  const fullPath = resolve(cwd, path);

  if (!existsSync(fullPath)) {
    const indexPath = resolve(fullPath, 'index.html');

    if (existsSync(indexPath)) {
      return indexPath;
    }

    try {
      const mainPath = require.resolve(path, {
        paths: [__dirname, process.cwd(), cwd],
      });
      const mainDir = dirname(mainPath);
      return resolve(mainDir, 'index.html');
    } catch {}
  }

  return fullPath;
}

export function clientOf(server: KrasServer, config: KrasConfiguration) {
  const index = getClient(config.directory, config.client);
  const target = config.api + '/';

  return (req: Request, res: Response) => {
    if (req.url.endsWith('/')) {
      res.sendFile(index);
    } else {
      res.redirect(target);
    }
  };
}
