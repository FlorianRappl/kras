import { resolve } from 'path';
import { Request, Response } from 'express';
import { KrasConfiguration, KrasServer } from '../types';

export function clientOf(server: KrasServer, config: KrasConfiguration) {
  const index = resolve(config.directory, config.client);
  const target = config.api + '/';

  return (req: Request, res: Response) => {
    if (req.url.endsWith('/')) {
      res.sendFile(index);
    } else {
      res.redirect(target);
    }
  };
}
