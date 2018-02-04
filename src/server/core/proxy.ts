import { Request, Response } from 'express';
import { createProxyServer } from 'http-proxy';
import { proxyRequest } from '../helpers/proxy-request';
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';
import { KrasAnswer } from '../types';

function sendResponse(req: Request, ans: KrasAnswer, res: Response) {
  const origin = req.headers['origin'];
  const type = ans.headers['content-type'];

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', type);
  res.statusCode = ans.status.code;
  res.end(ans.content);
}

export function withBody(callback: (req: Request, res: Response) => void) {
  return (req: Request, res: Response) => {
    const bodyParts: Array<Buffer> = [];

    return req
      .on('data', (chunk: Buffer) => bodyParts.push(chunk))
      .on('end', () => {
        req.body = Buffer.concat(bodyParts).toString();
        callback(req, res);
      });
  };
}

export function corsHandler(req: Request, res: Response) {
  const origin = req.headers.origin;
  res.statusCode = 200;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return res.end();
}
