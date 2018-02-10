import { basename } from 'path';
import { KrasInjectorOption } from '../types';

export function editFileOption(fileName: string): KrasInjectorOption {
  return {
    description: `Modify the file ${fileName} directly without using an external text editor.`,
    title: basename(fileName),
    type: 'file',
    value: Buffer.from(fileName).toString('base64'),
  };
}
