import { describe, it, expect } from 'vitest';
import { broadcastAt } from './broadcast';

describe('Management API - Broadcast', () => {
  it('broadcastAt should return a function', () => {
    // @ts-ignore
    const handler = broadcastAt(undefined);
    expect(typeof handler).toBe('function');
  });

  it('broadcastAt should call into the server', () => {
    let result: any;
    const server: any = {
      broadcast(msg: any) {
        result = msg;
      },
    };
    const req: any = {
      body: 'foo bar',
    };
    const handler = broadcastAt(server);
    handler(req, {
      sendStatus() {},
    } as any);
    expect(result).toBe(req.body);
  });
});
