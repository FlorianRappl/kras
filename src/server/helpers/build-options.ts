import { basename } from 'path';
import { KrasInjectorOption, KrasInjectorOptions } from '../types';

export function appendFileOption(options: KrasInjectorOptions, fileName: string) {
  options[`_${fileName}`] = editFileOption(fileName);
}

export function appendDirectoryOption(options: KrasInjectorOptions, directory: string) {
  options[directory] = editDirectoryOption(directory);
}

export function appendDirectoryOptions(options: KrasInjectorOptions, directories: Array<string>) {
  for (const directory of directories) {
    appendDirectoryOption(options, directory);
  }
}

export function editDirectoryOption(directory: string): KrasInjectorOption {
  return {
    description: `Changes the location of the directory ${directory}.`,
    title: basename(directory),
    type: 'text',
    value: directory,
  };
}

export function editFileOption(fileName: string): KrasInjectorOption {
  return {
    description: `Modify the file ${fileName} directly without using an external text editor.`,
    title: basename(fileName),
    type: 'file',
    value: Buffer.from(fileName).toString('base64'),
  };
}
