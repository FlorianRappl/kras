import * as request from 'request';
import { fromNode } from './build-response';
import { Request } from 'express';
import { KrasInjectorInfo } from '../types';
import { Headers } from 'request';

export interface ProxyCallback {
  (err?: Error, foo?: any): void;
}

export interface ProxyRequestOptions {
  url: string;
  method: string;
  headers: Headers;
  body: string;
}

export function proxyRequest(req: ProxyRequestOptions, callback: ProxyCallback, injector?: KrasInjectorInfo) {
  return request({
    url: req.url,
    rejectUnauthorized: false,
    method: req.method,
    encoding: null,
    headers: {
      ['authorization']: req.headers['authorization'],
      ['accept']: req.headers['accept'],
      ['content-type']: req.headers['content-type'],
    },
    body: req.body,
  }, (err, ans, body) => {
    if (err) {
      callback(err);
    } else {
      callback(undefined, fromNode(ans, body, injector));
    }
  });
};
