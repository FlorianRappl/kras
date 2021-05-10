import { Request, Response } from 'express';
import { mapReverse } from '../helpers';
import { KrasServer, KrasWebSocket, RecordedRequest, RecordedMessage, RecordedError } from '../types';

interface Item {
  id: string;
}

function get<T extends Item>(items: Array<T>, id: string) {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
  }
}

function getType(content: string) {
  try {
    const value = JSON.parse(content);
    return typeof value;
  } catch (e) {
    return typeof content;
  }
}

function convertRequest(item: RecordedRequest) {
  return {
    id: item.id,
    time: item.start,
    from: item.request.target,
    to: item.request.url,
    status: item.response.status.code,
    type: item.response.headers['content-type'],
    injector: item.response.injector.name,
  };
}

function convertMessage(item: RecordedMessage) {
  return {
    id: item.id,
    time: item.time,
    type: getType(item.content),
    size: item.content.length,
    received: item.from,
    origin: item.remote ? 'server' : item.from === 'kras' ? 'broadcast' : 'client',
  };
}

function convertMiss(item: RecordedError) {
  return {
    id: item.id,
    time: item.start,
    from: item.request.target,
    to: item.request.url,
    type: item.request.headers.accept,
  };
}

export function overview(server: KrasServer) {
  return (req: Request, res: Response) => {
    res.json({
      requests: mapReverse(server.recorder.requests, convertRequest),
      errors: mapReverse(server.recorder.errors, convertMiss),
      messages: mapReverse(server.recorder.messages, convertMessage),
    });
  };
}

export function liveData(server: KrasServer) {
  const clients: Array<KrasWebSocket> = [];
  const broadcast = (type: string, data: any) => {
    for (const client of clients) {
      client.send(
        JSON.stringify({
          type,
          data,
        }),
      );
    }
  };

  server.recorder.on('recorded-request', (item) => {
    broadcast('request', convertRequest(item));
  });

  server.recorder.on('recorded-message', (item) => {
    broadcast('message', convertMessage(item));
  });

  server.recorder.on('recorded-miss', (item) => {
    broadcast('error', convertMiss(item));
  });

  return (ws: KrasWebSocket) => {
    clients.push(ws);
    ws.on('close', () => {
      clients.splice(clients.indexOf(ws), 1);
    });
  };
}

export function requestDetails(server: KrasServer) {
  return (req: Request, res: Response) => {
    const id = req.params.id;
    const data = get(server.recorder.requests, id);
    res.json(data || {});
  };
}

export function messageDetails(server: KrasServer) {
  return (req: Request, res: Response) => {
    const id = req.params.id;
    const data = get(server.recorder.messages, id);
    res.json(data || {});
  };
}

export function errorDetails(server: KrasServer) {
  return (req: Request, res: Response) => {
    const id = req.params.id;
    const data = get(server.recorder.errors, id);
    res.json(data || {});
  };
}
