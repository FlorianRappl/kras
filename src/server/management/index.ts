import { KrasConfiguration, KrasServer } from '../types';
import { broadcastAt } from './broadcast';
import { readFile, saveFile } from './files';
import { errorDetails, messageDetails, overview, requestDetails, liveData } from './overview';
import { readSettings, saveSettings, downloadSettings } from './settings';
import { readInjectorsSettings, saveInjectorSettings, readInjectorSettings } from './injectors';
import { clientOf } from './client';
import { configOf, updateClient } from './basics';
import { userLogin, getAuth } from './login';
import { recentLogsOf, allLogsOf, liveLogs } from './logs';

export function withManagement(server: KrasServer, config: KrasConfiguration) {
  const api = config.api;

  if (api !== false) {
    const protect = getAuth(server, config);

    server.at(api).get(clientOf(server, config));

    server.at(api, 'login').post(userLogin(server, config));

    protect(server.at(api, 'config')).get(configOf(server, config)).put(updateClient(server, config));

    protect(server.at(api, 'logs')).get(recentLogsOf(server)).delete(allLogsOf(server)).feed(liveLogs(server));

    protect(server.at(api, 'broadcast')).post(broadcastAt(server));

    protect(server.at(api, 'data')).get(overview(server)).feed(liveData(server));

    protect(server.at(api, 'data', 'request', ':id')).get(requestDetails(server));

    protect(server.at(api, 'data', 'message', ':id')).get(messageDetails(server));

    protect(server.at(api, 'data', 'error', ':id')).get(errorDetails(server));

    protect(server.at(api, 'file', ':name')).get(readFile(server)).put(saveFile(server));

    protect(server.at(api, 'settings')).get(readSettings(server)).put(saveSettings(server));

    protect(server.at(api, 'settings', 'file')).get(downloadSettings(server, config));

    protect(server.at(api, 'injector')).get(readInjectorsSettings(server));

    protect(server.at(api, 'injector', ':name')).get(readInjectorSettings(server)).put(saveInjectorSettings(server));
  }
}
