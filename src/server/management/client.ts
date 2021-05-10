import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { Request, Response } from 'express';
import { KrasConfiguration, KrasServer } from '../types';

// this only exists to trick "ncc" -> otherwise it tries to resolve it
// directly at compile-time
const indexHtml = [0].map(() => 'index.html').pop();

function getClient(cwd: string, path: string) {
  const fullPath = resolve(cwd, path);

  if (!existsSync(fullPath)) {
    const indexPath = resolve(fullPath, indexHtml);

    if (existsSync(indexPath)) {
      return indexPath;
    }

    try {
      const mainPath = require.resolve(path, {
        paths: [__dirname, process.cwd(), cwd],
      });
      const mainDir = dirname(mainPath);
      return resolve(mainDir, indexHtml);
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
