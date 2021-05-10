import { Headers, Dict, KrasInjectorInfo, KrasAnswer } from '../types';

export type HarHeaders = Array<{
  name: string;
  value: string;
}>;

export interface HarRequest {
  url: string;
  method: string;
  target?: string;
  postData?: {
    text?: string;
  };
  headers: HarHeaders;
  queryString: HarHeaders;
}

export interface HarResponse {
  status: number;
  statusText: string;
  redirectURL: string;
  headers: HarHeaders;
  content: {
    encoding?: BufferEncoding;
    mimeType: string;
    text?: string;
  };
}

export interface NodeResponse {
  headers: Dict<string | Array<string>>;
  statusCode: number;
  statusMessage: string;
  url?: string;
  request: {
    href: string;
  };
}

interface ResponseState {
  statusCode: number;
  statusText: string;
  url: string;
  content: Buffer | string;
  redirectUrl: string;
  headers: Headers;
  injector: KrasInjectorInfo;
}

function setIfUndefined<T>(obj: Dict<any>, key: string, value: T) {
  if (obj[key] === undefined) {
    obj[key] = value;
  }

  return obj;
}

function set<T>(obj: Dict<any>, key: string, value: T) {
  obj[key] = value;
  return obj;
}

function buildResponse(state: Partial<ResponseState>): KrasAnswer {
  const status = {
    code: state.statusCode || 200,
    text: state.statusText || '',
  };
  const url = state.url || '';
  const content = state.content || '';
  const redirectUrl = state.redirectUrl;
  const headers = state.headers || {};
  const injector = state.injector || {};
  setIfUndefined(headers, 'content-type', 'text/html');
  setIfUndefined(injector, 'name', '(none)');

  return {
    status,
    url,
    content,
    redirectUrl,
    headers,
    injector,
  };
}

export function fromNode(ans: NodeResponse, body: Buffer, injector?: KrasInjectorInfo) {
  const headers: Headers = {};

  Object.keys(ans.headers).forEach((name) => {
    const value = ans.headers[name];
    headers[name] = Array.isArray(value) ? value.join() : value;
  });

  return buildResponse({
    statusCode: ans.statusCode,
    statusText: ans.statusMessage,
    url: ans.url || ans.request.href,
    headers,
    content: body,
    injector,
  });
}

export function fromHar(url: string, response: HarResponse, injector?: KrasInjectorInfo) {
  const encoding = response.content.encoding || 'utf8';
  const mimeType = response.content.mimeType;
  const text = response.content.text || '';
  const headers = response.headers.reduce((h, c) => set(h, c.name, c.value), {});
  setIfUndefined(headers, 'content-type', mimeType);

  return buildResponse({
    statusCode: response.status,
    statusText: response.statusText,
    url,
    redirectUrl: response.redirectURL,
    headers,
    content: Buffer.from(text, encoding),
    injector,
  });
}

export function fromJson(
  url: string,
  statusCode: number,
  statusText: string,
  headers: Headers,
  content: string | Buffer,
  injector?: KrasInjectorInfo,
) {
  return buildResponse({
    statusCode,
    statusText,
    url,
    headers,
    content,
    injector,
  });
}

export function fromMissing(url: string) {
  const headers = {
    ['content-type']: 'text/plain',
  };
  return buildResponse({
    url,
    statusCode: 500,
    statusText: 'Error',
    headers,
    content: 'Entry not found.',
  });
}
