import { readFileSync } from 'fs';
import { SslConfiguration } from '../types';

export function readSsl(config?: Partial<SslConfiguration>) {
  if (typeof config === 'object' && config.key && config.cert) {
    return {
      key: readFileSync(config.key),
      cert: readFileSync(config.cert),
    };
  }
}
