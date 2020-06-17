import * as io from './io';
import * as chokidar from 'chokidar';
import { resolve } from 'path';

jest.mock('./io', () => ({
  ...jest.requireActual('./io'),
  mk: jest.fn(),
}));

jest.mock('fs', () => ({
  readdirSync: jest.fn(() => []),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

jest.mock('chokidar', () => ({
  watch: jest.fn(),
}));

describe('io helpers', () => {
  it('watch should work against a single directory', () => {
    const found: Array<string> = [];
    chokidar.watch.mockImplementation(() => ({
      on() {
        return this;
      },
    }));
    const w = io.watch('foo', '*.jpg', (_, file) => {
      found.push(file);
    });
    expect(w.directories).toEqual(['foo']);
    expect(found).toEqual([]);
  });

  it('watch should find some files in the directory', () => {
    const found: Array<string> = [];
    chokidar.watch.mockImplementation(() => ({
      on(type: string, cb: (file: string) => void) {
        if (type === 'add') {
          ['qux.jpg', 'baz.jpg'].forEach(cb);
        }
        return this;
      },
    }));
    const w = io.watch('foo', '*.jpg', (_, file) => {
      found.push(file);
    });
    expect(w.directories).toEqual(['foo']);
    expect(found).toEqual([resolve('foo', 'qux.jpg'), resolve('foo', 'baz.jpg')]);
  });

  it('watch should work against multiple directories', () => {
    const found: Array<string> = [];
    chokidar.watch.mockImplementation(() => ({
      on() {
        return this;
      },
    }));
    const w = io.watch(['foo', 'bar'], '*.jpg', (_, file) => {
      found.push(file);
    });
    expect(w.directories).toEqual(['foo', 'bar']);
    expect(found).toEqual([]);
  });
});
