import { resolve } from 'path';
import { configOf } from './basics';

describe('Management API - Basics', () => {
  it('configOf should return a function', () => {
    const handler = configOf(undefined, undefined);
    expect(typeof handler).toBe('function');
  });

  it('configOf should read the version from the pkg json', () => {
    const version = require(resolve(__dirname, '../../../package.json')).version;
    const config: any = {};
    const handler = configOf(undefined, config);
    let result: any;
    handler(undefined, {
      json(obj: any) {
        result = obj;
      },
    } as any);
    expect(result).toHaveProperty('version', version);
  });

  it('configOf should have the directory and name from the config', () => {
    const config: any = {
      name: 'foo',
      directory: 'bar',
    };
    const handler = configOf(undefined, config);
    let result: any;
    handler(undefined, {
      json(obj: any) {
        result = obj;
      },
    } as any);
    expect(result).toHaveProperty('name', config.name);
    expect(result).toHaveProperty('directory', config.directory);
  });
});
