import { resolve, join } from 'path';
import { existsSync } from 'fs';

export const rootDir = resolve(__dirname, '..', '..');
export const currentDir = process.cwd();

export const krasrc = '.krasrc';

function optional(p: string) {
  try {
    if (existsSync(projectFile)) {
      return require(p);
    }
  } catch (e) {}

  return undefined;
}

function isInjectorDebug(name: string) {
  return (
    /^kras\-[A-Za-z0-9\-]+\-injector$/.test(name) ||
    /^[A-Za-z0-9\-]+\-kras\-injector$/.test(name) ||
    /^[A-Za-z0-9\-]+\-injector$/.test(name)
  );
}

const packageJson = 'package' + '.json';
const packageInfo = require('../../package.json');
const projectFile = join(currentDir, packageJson);
const projectInfo = optional(projectFile) || {};

export const author: string = packageInfo.author;
export const name: string = packageInfo.name;
export const version: string = packageInfo.version;
export const injectorDebug = isInjectorDebug(projectInfo.name);
export const injectorConfig = Object.assign({ active: true }, projectInfo.krasOptions || {});
export const injectorMain = resolve(currentDir, projectInfo.main || 'index.js');
