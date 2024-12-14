import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { configOf } from './basics';

describe('Management API - Basics', () => {
  it('configOf should return a function', () => {
    // @ts-ignore
    const handler = configOf(undefined, undefined);
    expect(typeof handler).toBe('function');
  });

  it('configOf should read the version from the pkg json', () => {
    const version = require(resolve(__dirname, '../../../package.json')).version;
    const config: any = {};
    // @ts-ignore
    const handler = configOf(undefined, config);
    let result: any;
    // @ts-ignore
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
    // @ts-ignore
    const handler = configOf(undefined, config);
    let result: any;
    // @ts-ignore
    handler(undefined, {
      json(obj: any) {
        result = obj;
      },
    } as any);
    expect(result).toHaveProperty('name', config.name);
    expect(result).toHaveProperty('directory', config.directory);
  });
});
