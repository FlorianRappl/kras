import { resolve } from 'path';

export const rootDir = resolve(__dirname, '..', '..', '..');
const packageInfo = require(resolve(rootDir, 'package.json'));

function isInjectorDebug(name: string) {
  return /^kras\-[A-Za-z0-9\-]+\-injector$/.test(name) ||
    /^[A-Za-z0-9\-]+\-kras\-injector$/.test(name) ||
    /^[A-Za-z0-9\-]+\-injector$/.test(name);
}

export const currentDir = process.cwd();
export const author: string = packageInfo.author;
export const name: string = packageInfo.name;
export const version: string = packageInfo.version;
export const injectorDebug: boolean = isInjectorDebug(packageInfo.name);
export const injectorConfig = packageInfo.krasOptions || {};
export const injectorMain: string = resolve(rootDir, packageInfo.main || 'index.js');
