import { KrasConfiguration, KrasServer } from '../types';
import { broadcastAt } from './broadcast';
import { readFile, saveFile } from './files';
import { errorDetails, messageDetails, overview, requestDetails, liveData } from './overview';
import { readSettings, saveSettings } from './settings';
import { readInjectorsSettings, saveInjectorSettings, readInjectorSettings } from './injectors';
import { clientOf } from './client';
import { configOf, updateClient } from './basics';
import { userLogin, getAuth } from './login';
import { recentLogsOf, allLogsOf, liveLogs } from './logs';

export function withManagement(server: KrasServer, config: KrasConfiguration) {
  const api = config.api;

  if (api !== false) {
    const protectAccess = getAuth(server, config);

    server.at(api)
      .get(clientOf(server, config));

    server.at(api, 'login')
      .post(userLogin(server, config));

    server.at(api, 'config')
      .any(protectAccess)
      .get(configOf(server, config))
      .put(updateClient(server, config));

    server.at(api, 'logs')
      .any(protectAccess)
      .get(recentLogsOf(server))
      .delete(allLogsOf(server))
      .feed(liveLogs(server));

    server.at(api, 'broadcast')
      .any(protectAccess)
      .post(broadcastAt(server));

    server.at(api, 'data')
      .any(protectAccess)
      .get(overview(server))
      .feed(liveData(server));

    server.at(api, 'data', 'request', ':id')
      .any(protectAccess)
      .get(requestDetails(server));

    server.at(api, 'data', 'message', ':id')
      .any(protectAccess)
      .get(messageDetails(server));

    server.at(api, 'data', 'error', ':id')
      .any(protectAccess)
      .get(errorDetails(server));

    server.at(api, 'file', ':name')
      .any(protectAccess)
      .get(readFile(server))
      .put(saveFile(server));

    server.at(api, 'settings')
      .any(protectAccess)
      .get(readSettings(server))
      .put(saveSettings(server));

    server.at(api, 'injector')
      .any(protectAccess)
      .get(readInjectorsSettings(server));

    server.at(api, 'injector', ':name')
      .any(protectAccess)
      .get(readInjectorSettings(server))
      .put(saveInjectorSettings(server));
  }
};
