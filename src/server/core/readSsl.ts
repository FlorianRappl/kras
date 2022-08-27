import { readFileSync } from 'fs';
import { SslConfiguration } from '../types';

function fileReader(path: string) {
  try {
    path = require.resolve(path);
  } catch {}

  return readFileSync(path);
}

export function readSsl(config?: Partial<SslConfiguration>) {
  if (typeof config === 'object' && config.key && config.cert) {
    return {
      key: fileReader(config.key),
      cert: fileReader(config.cert),
    };
  }
}
