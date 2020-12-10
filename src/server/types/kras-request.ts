import { IncomingHttpHeaders } from 'http';

export interface KrasRequestQuery {
  [key: string]: string;
}

export interface BasicKrasRequest {
  url: string;
  target: string;
  query: KrasRequestQuery;
  method: string;
  headers: IncomingHttpHeaders;
  content: string;
}

export interface KrasRequest extends BasicKrasRequest {
  encrypted: boolean;
  remoteAddress: string;
  port: string;
}
