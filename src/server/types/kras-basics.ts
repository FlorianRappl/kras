export interface Dict<T> {
  [key: string]: T;
}

export interface SslConfiguration {
  key: string;
  cert: string;
}

export interface StoredFileEntry {
  id?: number;
  active: boolean;
  file: string;
  method?: string;
  url?: string;
  error?: Error;
}

export type Headers = Dict<string>;
