import { readFileSync } from 'fs';
import { isAbsolute } from 'path';
import { SslConfiguration } from '../types';

function fileReader(path: string) {
  if (!isAbsolute(path)) {
    try {
      path = require.resolve(path);
    } catch {}
  }

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
