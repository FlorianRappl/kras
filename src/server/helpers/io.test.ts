import { vi, it, describe, expect } from 'vitest';
import * as io from './io';
import * as chokidar from 'chokidar';
import { resolve } from 'path';

vi.mock('./io', async () => ({
  ...(await vi.importActual('./io')),
  mk: vi.fn(),
}));

vi.mock('fs', () => ({
  readdirSync: vi.fn(() => []),
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
}));

vi.mock('chokidar', () => ({
  watch: vi.fn(),
}));

describe('io helpers', () => {
  it('watch should work against a single directory', () => {
    const found: Array<string> = [];
    // @ts-ignore
    chokidar.watch.mockImplementation(() => ({
      on() {
        return this;
      },
    }));
    const w = io.watch('foo', ['.jpg'], (_, file) => {
      found.push(file);
    });
    expect(w.directories).toEqual(['foo']);
    expect(found).toEqual([]);
  });

  it('watch should find some files in the directory', () => {
    const found: Array<string> = [];
    // @ts-ignore
    chokidar.watch.mockImplementation(() => ({
      on(type: string, cb: (file: string) => void) {
        if (type === 'add') {
          ['qux.jpg', 'baz.jpg'].forEach(cb);
        }
        return this;
      },
    }));
    const w = io.watch('foo', ['.jpg'], (_, file) => {
      found.push(file);
    });
    expect(w.directories).toEqual(['foo']);
    expect(found).toEqual([resolve('foo', 'qux.jpg'), resolve('foo', 'baz.jpg')]);
  });

  it('watch should work against multiple directories', () => {
    const found: Array<string> = [];
    // @ts-ignore
    chokidar.watch.mockImplementation(() => ({
      on() {
        return this;
      },
    }));
    const w = io.watch(['foo', 'bar'], ['.jpg'], (_, file) => {
      found.push(file);
    });
    expect(w.directories).toEqual(['foo', 'bar']);
    expect(found).toEqual([]);
  });
});
