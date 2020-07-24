import * as request from 'request';
import { fromNode } from './build-response';
import { KrasInjectorInfo } from '../types';

export const defaultProxyHeaders = [
  'authorization',
  'accept',
  'content-type',
  'cookie',
  'accept-language',
  'user-agent',
  'if-match',
  'if-range',
  'if-unmodified-since',
  'if-none-match',
  'if-modified-since',
  'pragma',
  'range',
];

export interface ProxyCallback {
  (err?: Error, foo?: any): void;
}

export interface ProxyRequestOptions {
  url: string;
  method: string;
  headers: request.Headers;
  body: string;
  agentOptions?: any;
  proxy?: any;
  injector?: KrasInjectorInfo;
  redirect?: boolean;
}

export function proxyRequest(req: ProxyRequestOptions, callback: ProxyCallback) {
  return request(
    {
      url: req.url,
      rejectUnauthorized: false,
      method: req.method,
      //tslint:disable-next-line
      encoding: null,
      proxy: req.proxy,
      agentOptions: req.agentOptions,
      headers: req.headers,
      body: req.body,
      followRedirect: req.redirect ?? true,
    },
    (err, ans, body) => {
      if (err) {
        callback(err);
      } else {
        callback(undefined, fromNode(ans, body, req.injector));
      }
    },
  );
}
