import WebSocket from 'ws';
import type { EventEmitter } from 'events';
import type { Headers, KrasWebSocket } from '../types';

interface BufferEntry {
  time: number;
  data: WebSocket.Data;
}

function releaseFrom(buffer: Array<BufferEntry>, ws: WebSocket) {
  const item = buffer.shift();
  ws.send(item.data);

  if (buffer.length) {
    const diff = buffer[0].time - item.time;
    setTimeout(() => releaseFrom(buffer, ws), diff);
  }
}

interface CurrentWebSocket {
  open: boolean;
  ws: KrasWebSocket | undefined;
  buffer: Array<BufferEntry>;
  signal: AbortSignal;
  log(err: Error): void;
}

function connect(current: CurrentWebSocket, options: ProxyWebSocketOptions) {
  const { url, core } = options;
  const protocol = options.ws.protocol || undefined;

  const ws = new WebSocket(url, protocol, {
    rejectUnauthorized: false,
    headers: options.headers,
  });

  ws.on('error', current.log);

  ws.on('open', () => {
    current.open = true;

    if (current.buffer.length) {
      releaseFrom(current.buffer, ws);
    }
  });

  ws.on('close', (e) => {
    const retry = !current.signal.aborted;
    current.open = false;
    core.emit('ws-closed', { reason: e, retry });

    if (retry) {
      core.emit('info', `WebSocket connection interrupted. Retrying in 5s.`);

      setTimeout(() => {
        if (!current.signal.aborted) {
          connect(current, options);
        }
      }, 5_000);
    }
  });

  ws.on('message', (data) => {
    core.emit('message', { content: data, from: url, to: options.id, remote: true });
    options.ws.send(data, current.log);
  });

  current.signal.onabort = () => ws.close();
  current.ws = ws;
}

export interface ProxyWebSocketOptions {
  id: string;
  ws: KrasWebSocket;
  url: string;
  headers: Headers;
  core: EventEmitter;
}

export interface WebSocketDisposer {
  (): void;
}

export function proxyWebSocket(client: ProxyWebSocketOptions): WebSocketDisposer {
  const ac = new AbortController();
  const server: CurrentWebSocket = {
    open: false,
    ws: undefined,
    buffer: [],
    signal: ac.signal,
    log(err) {
      err && client.core.emit('error', err);
    },
  };

  connect(server, client);

  client.ws.on('message', (data: WebSocket.Data) => {
    client.core.emit('message', { content: data, to: client.url, from: client.id, remote: false });

    if (server.open) {
      server.ws.send(data, server.log);
    } else {
      server.buffer.push({
        time: Date.now(),
        data,
      });
    }
  });

  return () => {
    ac.abort();
  };
}
