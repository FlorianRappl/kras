import axios, { AxiosResponseHeaders, RawAxiosResponseHeaders, RawAxiosRequestHeaders } from 'axios';
import { Agent } from 'https';
import { fromNode } from './build-response';
import { Dict, KrasAnswer, KrasInjectorInfo } from '../types';

function convertHeaders(headers: RawAxiosResponseHeaders | AxiosResponseHeaders) {
  const result: Dict<string | Array<string>> = {};

  Object.entries(headers).forEach(([name, value]) => {
    if (Array.isArray(value)) {
      result[name] = value.map((n) => `${n}`);
    } else {
      result[name] = `${value}`;
    }
  });

  return result;
}

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

export interface ProxyRequestOptions {
  url: string;
  method: string;
  headers: RawAxiosRequestHeaders;
  body: Buffer;
  agentOptions?: any;
  proxy?: any;
  injector?: KrasInjectorInfo;
  redirect?: boolean;
}

export async function proxyRequest(req: ProxyRequestOptions): Promise<KrasAnswer> {
  const res = await axios.request({
    url: req.url,
    httpsAgent: new Agent({
      rejectUnauthorized: false,
      ...req.agentOptions,
    }),
    responseType: 'arraybuffer',
    method: req.method,
    validateStatus: () => true,
    proxy: req.proxy,
    headers: req.headers,
    data: req.body,
    maxRedirects: req.redirect ? undefined : 0,
  });

  return fromNode(
    {
      headers: convertHeaders(res.headers),
      request: {
        href: req.url,
      },
      statusCode: res.status,
      statusMessage: res.statusText,
      url: res.config.url,
    },
    res.data,
    req.injector,
  );
}
