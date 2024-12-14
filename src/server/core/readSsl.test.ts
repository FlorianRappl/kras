import { vi, it, describe, expect } from 'vitest';
import { readSsl } from './readSsl';
import * as fs from 'fs';

vi.mock('fs', () => ({
  readFileSync: vi.fn().mockImplementation((name) => `${name}_content`),
}));

describe('readSsl', () => {
  it('should not read if nothing provided', () => {
    const result = readSsl();
    expect(result).toBeUndefined();
  });

  it('should not read if only a certificate is specified', () => {
    const result = readSsl({ cert: 'foo' });
    expect(result).toBeUndefined();
  });

  it('should not read if only a key is specified', () => {
    const result = readSsl({ key: 'foo' });
    expect(result).toBeUndefined();
  });

  it('should read from file system if both specified', () => {
    const result = readSsl({ key: 'foo', cert: 'bar' });
    expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      key: 'foo_content',
      cert: 'bar_content',
    });
  });
});
