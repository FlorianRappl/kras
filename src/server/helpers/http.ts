import { Request } from 'express';

export function isEncrypted(req: any) {
  return Boolean(req.isSpdy || req.connection.encrypted || req.connection.pair);
}

export function getPort(req: Request) {
  const res = req.headers.host ? req.headers.host.match(/:(\d+)/) : '';
  return res ? res[1] : isEncrypted(req) ? '443' : '80';
}
