import * as gaze from 'gaze';
import { statSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { EventEmitter } from 'events';

export function isFile(file: string) {
  return statSync(file).isFile();
}

export function mk(directory: string) {
  if (!existsSync(directory)){
    mkdirSync(directory);
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

export function asJson<T = {}>(file: string): T {
  if (existsSync(file)) {
    const content = readFileSync(file, 'utf8');
    return JSON.parse(content);
  }

  return undefined;
}

export function asScript(file: string) {
  if (existsSync(file)) {
    const key = require.resolve(file);
    delete require.cache[key];
    return require(file);
  }

  return () => {};
}

export function toFile<T>(file: string, obj: T) {
  const directory = dirname(file);
  mk(directory);
  writeFileSync(file, JSON.stringify(obj));
  return file;
}

interface GazeWatcher extends EventEmitter {
  watched(): {
    [dir: string]: Array<string>;
  };
}

interface SingleWatcher {
  directory: string;
  close(): void;
}

export interface Watcher {
  directories: Array<string>;
  close(): void;
}

function watchSingle(directory: string, pattern: string, callback: (type: string, file: string) => void): SingleWatcher {
  const updateFile = (file: string) => callback('update', file);
  const deleteFile = (file: string) => callback('delete', file);
  const loadFile = (file: string) => callback('create', file);
  const opt = { cwd: directory };
  const w = gaze(pattern, opt, (err: Error, watcher: GazeWatcher) => {
    const watched = watcher.watched();
    const loadDir = (dir: string) => watched[dir].forEach(loadFile);
    Object.keys(watched).forEach(loadDir);
    watcher.on('changed', updateFile);
    watcher.on('added', loadFile);
    watcher.on('deleted', deleteFile);
  });
  return {
    directory,
    close() {
      const dirs = w.watched();

      for (const dir of Object.keys(dirs)) {
        for (const file of dirs[dir]) {
          deleteFile(file);
        }
      }

      w.close();
    },
  }
}

export function watch(directory: string | Array<string>, pattern: string, callback: (type: string, file: string) => void): Watcher {
  if (Array.isArray(directory)) {
    const ws = directory.map(dir => watchSingle(dir, pattern, callback));
    return {
      get directories() {
        return ws.map(w => w.directory);
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
            added.push(watchSingle(v, pattern, callback));
          }
        }

        ws.push(...added);
      },
      close() {
        ws.forEach(w => w.close());
      },
    };
  } else if (typeof directory === 'string') {
    return watch([directory], pattern, callback);
  }
}
