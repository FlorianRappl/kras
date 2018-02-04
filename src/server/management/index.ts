import { resolve } from 'path';
import { Request, Response } from 'express';
import { KrasConfiguration, KrasServer } from '../types';
import { broadcastAt } from './broadcast';
import { errorDetails, messageDetails, overview, requestDetails } from './overview';
import { readSettings, saveSettings } from './settings';
import { readInjectorsSettings, saveInjectorSettings } from './injectors';
import { configOf } from './basics';

function clientOf(server: KrasServer, config: KrasConfiguration) {
  const index = resolve(config.directory, config.client);
  const target = config.api + '/';
  return (req: Request, res: Response) => {
    if (req.url.endsWith('/')) {
      res.sendFile(index);
    } else {
      res.redirect(target);
    }
  }
}

export function withManagement(server: KrasServer, config: KrasConfiguration) {
  const api = config.api;

  server.at(api)
    .get(clientOf(server, config));

  server.at(api, 'config')
    .get(configOf(server, config));

  server.at(api, 'broadcast')
    .post(broadcastAt(server));

  server.at(api, 'data')
    .get(overview(server));

  server.at(api, 'data', 'request', ':id')
    .get(requestDetails(server));

  server.at(api, 'data', 'message', ':id')
    .get(messageDetails(server));

  server.at(api, 'data', 'error', ':id')
    .get(errorDetails(server));

  server.at(api, 'settings')
    .get(readSettings(server))
    .put(saveSettings(server));

  server.at(api, 'injector')
    .get(readInjectorsSettings(server));

  server.at(api, 'injector', ':name')
    .put(saveInjectorSettings(server));
};
