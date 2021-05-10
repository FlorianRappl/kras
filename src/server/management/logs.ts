import { Request, Response } from 'express';
import { filterReverse } from '../helpers';
import { KrasServer, KrasWebSocket } from '../types';

const maxEntries = 50;

export function recentLogsOf(server: KrasServer) {
  return (req: Request, res: Response) => {
    res.json({
      entries: filterReverse(server.logs, (_1, _2, i) => i < maxEntries),
    });
  };
}

export function allLogsOf(server: KrasServer) {
  return (req: Request, res: Response) => {
    server.logs.splice(0, server.logs.length);
    res.sendStatus(200);
  };
}

export function liveLogs(server: KrasServer) {
  const clients: Array<KrasWebSocket> = [];
  const broadcast = <T>(entry: T) => {
    for (const client of clients) {
      client.send(JSON.stringify(entry));
    }
  };

  server.on('logged', (item) => {
    broadcast(item);
  });

  return (ws: KrasWebSocket) => {
    clients.push(ws);
    ws.on('close', () => {
      clients.splice(clients.indexOf(ws), 1);
    });
  };
}
