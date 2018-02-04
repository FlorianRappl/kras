import { IncomingHttpHeaders } from 'http';

export interface KrasRequestQuery {
  [key: string]: string;
}

export interface KrasRequest {
  url: string;
  target: string;
  query: KrasRequestQuery;
  method: string;
  headers: IncomingHttpHeaders;
  content: string;
}
