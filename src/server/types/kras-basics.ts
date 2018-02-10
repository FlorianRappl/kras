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
  error?: string;
}

export type LogLevel = 'debug' | 'info' | 'error';

export type LogEntryType = 'error';

export interface LogEntry {
  type: LogEntryType;
  time: Date;
  data: any;
}

export type Headers = Dict<string>;
