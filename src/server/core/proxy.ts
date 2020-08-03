import { Request, Response } from 'express';
import { KrasAnswer } from '../types';

export function sendResponse(req: Request, ans: KrasAnswer, res: Response) {
  const origin = req.headers.origin;
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
  const headers = ['authorization', 'content-type'];
  const requestHeaders = req.headers['access-control-request-headers'];
  if (requestHeaders) {
    headers.push(requestHeaders);
  }
  res.statusCode = 200;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', headers.join(','));
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return res.end();
}
