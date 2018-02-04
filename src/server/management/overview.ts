import { Request, Response } from 'express';
import { KrasServer } from '../types';

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

function mapReverse<T, U>(items: Array<T>, select: (item: T, index: number) => U): Array<U> {
  const dest: Array<U> = [];

  for (let i = items.length; i--; ) {
    dest.push(select(items[i], i));
  }

  return dest;
}

export function overview(server: KrasServer) {
  return (req: Request, res: Response) => {
    const id = req.params.id;
    res.json({
      requests: mapReverse(server.recorder.requests, item => ({
        id: item.id,
        time: item.start,
        from: item.request.target,
        status: item.response.status.code,
        type: item.request.headers['content-type'],
        injector: item.response.injector.name,
      })),
      errors: mapReverse(server.recorder.errors, item => ({
        id: item.id,
        time: item.start,
        from: item.request.target,
        type: item.request.headers['content-type'],
      })),
      messages: mapReverse(server.recorder.messages, item => ({
        id: item.id,
        time: item.time,
        type: getType(item.content),
        size: item.content.length,
      })),
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
