import * as readFile from 'send';
import { dirname } from 'path';
import { KrasServer, KrasConfiguration } from '../types';

export function withFiles(server: KrasServer, config: KrasConfiguration) {
  const api = config.api;

  if (api !== false) {
    const prefix = `${api}/static/`;
    const options = {
      root: dirname(config.client),
    };

    server.at(api, 'static/*').get((req, res) => {
      const path = req.url.substr(prefix.length);
      readFile(req, path, options).pipe(res);
    });
  }
}
