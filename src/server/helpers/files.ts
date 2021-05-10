import * as readFile from 'send';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { KrasServer, KrasConfiguration } from '../types';

// this only exists to trick "ncc" -> otherwise it tries to resolve it
// directly at compile-time
const indexHtml = [0].map(() => 'index.html').pop();

export function getClient(cwd: string, path: string) {
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

export function withFiles(server: KrasServer, config: KrasConfiguration) {
  const api = config.api;

  if (api !== false) {
    const prefix = `${api}/static/`;
    const root = dirname(getClient(config.directory, config.client));
    const options = {
      root,
    };

    server.at(api, 'static/*').get((req, res) => {
      const path = req.url.substr(prefix.length);
      readFile(req, path, options).pipe(res);
    });
  }
}
