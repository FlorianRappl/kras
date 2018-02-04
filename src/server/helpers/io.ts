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

export function watch(directory: string, pattern: string, callback: (type: string, file: string) => void) {
  const opt = { cwd: directory };
  gaze(pattern, opt, (err: Error, watcher: GazeWatcher) => {
    const watched = watcher.watched();
    const updateFile = (file: string) => callback('update', file);
    const deleteFile = (file: string) => callback('delete', file);
    const loadFile = (file: string) => callback('create', file);
    const loadDir = (dir: string) => watched[dir].forEach(loadFile);
    Object.keys(watched).forEach(loadDir);
    watcher.on('changed', updateFile);
    watcher.on('added', loadFile);
    watcher.on('deleted', deleteFile);
  });
}
