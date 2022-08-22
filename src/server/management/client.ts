import { Request, Response } from 'express';
import { getClient } from '../helpers';
import { KrasConfiguration, KrasServer } from '../types';

export async function clientOf(server: KrasServer, config: KrasConfiguration) {
  const index = await getClient(config.directory, config.client);
  const target = config.api + '/';

  return (req: Request, res: Response) => {
    if (req.url.endsWith('/')) {
      res.sendFile(index);
    } else {
      res.redirect(target);
    }
  };
}
