import { readFileSync } from 'fs';
import { SslConfiguration } from '../types';

function fileReader(path: string) {
  try {
    return readFileSync(path);
  } catch (e) {
    // try to read file from node_modules
    return readFileSync(require.resolve(path));
  }
}

export function readSsl(config?: Partial<SslConfiguration>) {
  if (typeof config === 'object' && config.key && config.cert) {
    return {
      key: fileReader(config.key),
      cert: fileReader(config.cert),
    };
  }
}
