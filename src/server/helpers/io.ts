import * as chokidar from 'chokidar';
import { statSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve, sep, relative, isAbsolute } from 'path';

export function isFile(file: string) {
  return statSync(file).isFile();
}

export function mk(directory: string) {
  if (!existsSync(directory)) {
    directory.split(sep).reduce((parentDir, childDir) => {
      const curDir = resolve(parentDir, childDir);

      if (!existsSync(curDir)) {
        mkdirSync(curDir);
      }

      return curDir;
    }, sep);

    return true;
  }

  return false;
}

export function ls(directory: string) {
  if (existsSync(directory)) {
    return readdirSync(directory);
  }

  return [];
}

export function toAbsolute(directory: string) {
  return (file: string) => join(directory, file);
}

export function asJson<T = {}>(file: string, defaultValue: T): T {
  if (existsSync(file)) {
    try {
      const content = readFileSync(file, 'utf8');
      return JSON.parse(content);
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
}

export async function asScript(file: string) {
  if (existsSync(file)) {
    const key = require.resolve(file);
    delete require.cache[key];

    if (key.endsWith('.mjs')) {
      const result = await import(key);
      return result.default || result;
    } else {
      return require(file);
    }
  }

  return () => {};
}

export function toFile<T>(file: string, obj: T) {
  const directory = dirname(file);
  mk(directory);
  writeFileSync(file, JSON.stringify(obj));
  return file;
}

interface SingleWatcher {
  directory: string;
  close(): void;
}

interface WatchEvent {
  (file: string): void;
}

export interface Watcher {
  directories: Array<string>;
  close(): void;
}

export function isInDirectory(fn: string, dir: string) {
  const rel = relative(dir, fn);
  return !!rel && !rel.startsWith('..') && !isAbsolute(rel);
}

function installWatcher(
  directory: string,
  extensions: Array<string>,
  loadFile: WatchEvent,
  updateFile: WatchEvent,
  deleteFile: WatchEvent,
) {
  mk(directory);
  return chokidar
    .watch('.', {
      cwd: directory,
      ignored: (path, stats) => stats?.isFile() && extensions.every((extension) => !path.endsWith(extension)),
    })
    .on('change', updateFile)
    .on('add', loadFile)
    .on('unlink', deleteFile);
}

function watchSingle(
  directory: string,
  extensions: Array<string>,
  callback: (type: string, file: string) => void,
  watched: Array<string>,
): SingleWatcher {
  const updateFile = (file: string) => {
    const fn = resolve(directory, file);
    callback('update', fn);
  };
  const deleteFile = (file: string) => {
    const fn = resolve(directory, file);
    const idx = watched.indexOf(fn);
    idx !== -1 && watched.splice(idx, 1);
    callback('delete', fn);
  };
  const loadFile = (file: string) => {
    const fn = resolve(directory, file);
    callback('create', fn);
  };
  const w = installWatcher(directory, extensions, loadFile, updateFile, deleteFile);
  return {
    directory,
    close() {
      const dirs = w.getWatched();

      for (const dir of Object.keys(dirs)) {
        for (const file of dirs[dir]) {
          const fn = resolve(directory, dir, file);
          const idx = watched.indexOf(fn);
          idx !== -1 && watched.splice(idx, 1);
          callback('delete', fn);
        }
      }

      w.close();
    },
  };
}

export function watch(
  directory: string | Array<string>,
  extensions: Array<string>,
  callback: (type: string, file: string) => void,
  watched: Array<string> = [],
): Watcher {
  if (Array.isArray(directory)) {
    const ws = directory.map((dir) => watchSingle(dir, extensions, callback, watched));

    return {
      get directories() {
        return ws.map((w) => w.directory);
      },
      set directories(value: Array<string>) {
        const added: Array<SingleWatcher> = [];

        for (let i = ws.length; i--; ) {
          const w = ws[i];
          let remove = true;

          for (const v of value) {
            if (w.directory === v) {
              remove = false;
              break;
            }
          }

          if (remove) {
            ws.splice(i, 1);
            w.close();
          }
        }

        for (const v of value) {
          let add = true;

          for (const w of ws) {
            if (w.directory === v) {
              add = false;
              break;
            }
          }

          if (add) {
            added.push(watchSingle(v, extensions, callback, watched));
          }
        }

        ws.push(...added);
      },
      close() {
        ws.forEach((w) => w.close());
      },
    };
  } else if (typeof directory === 'string') {
    return watch([directory], extensions, callback, watched);
  }
}
