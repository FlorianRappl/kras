import { resolve } from 'path';

export const rootDir = resolve(__dirname, '..', '..', '..');
const packageInfo = require(resolve(rootDir, 'package.json'));

export const currentDir = process.cwd();
export const author: string = packageInfo.author;
export const name: string = packageInfo.name;
export const version: string = packageInfo.version;
