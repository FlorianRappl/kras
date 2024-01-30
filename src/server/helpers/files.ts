import readFile from 'send';
import { resolve, dirname } from 'path';
import { exists } from 'fs';
import { distDir } from '../info';
import { KrasServer, KrasConfiguration } from '../types';

// this only exists to trick "ncc" -> otherwise it tries to resolve it
// directly at compile-time
const indexHtml = [0].map(() => 'index.html').pop();

function checkExists(dir: string) {
  return new Promise<boolean>((resolve) => exists(dir, resolve));
}

export async function getClient(cwd: string, path: string) {
  const fullPath = resolve(cwd, path);

  if (!(await checkExists(fullPath))) {
    const indexPath = resolve(fullPath, indexHtml);

    if (await checkExists(indexPath)) {
      return indexPath;
    }

    try {
      const mainPath = require.resolve(path, {
        paths: [distDir, process.cwd(), cwd],
      });
      const mainDir = dirname(mainPath);
      return resolve(mainDir, indexHtml);
    } catch {}
  }

  return fullPath;
}

export async function withFiles(server: KrasServer, config: KrasConfiguration) {
  const api = config.api;

  if (api !== false) {
    const prefix = `${api}/static/`;
    const client = await getClient(config.directory, config.client);
    const root = dirname(client);
    const options = { root };

    server.at(api, 'static/*').get((req, res) => {
      const path = req.url.substring(prefix.length);
      readFile(req, path, options).pipe(res);
    });
  }
}
