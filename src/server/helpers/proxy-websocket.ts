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

export function proxyWebSocket(options: ProxyWebSocketOptions): WebSocketDisposer {
  let open = false;
  const buffer: Array<BufferEntry> = [];
  const { url, core } = options;

  const ws = new WebSocket(url, options.ws.protocol, {
    rejectUnauthorized: false,
    headers: options.headers,
  });

  ws.on('error', (err) => this.logError(err));

  ws.on('open', () => {
    open = true;

    if (buffer.length) {
      releaseFrom(buffer, ws);
    }
  });

  ws.on('close', (e) => {
    open = false;
    core.emit('ws-closed', { reason: e });
  });

  ws.on('message', (data) => {
    core.emit('message', { content: data, from: url, to: options.id, remote: true });
    options.ws.send(data, (err) => this.logError(err));
  });

  options.ws.on('message', (data: WebSocket.Data) => {
    core.emit('message', { content: data, to: url, from: options.id, remote: false });

    if (open) {
      ws.send(data, (err) => this.logError(err));
    } else {
      buffer.push({
        time: Date.now(),
        data,
      });
    }
  });

  return () => {
    ws.close();
  };
}
