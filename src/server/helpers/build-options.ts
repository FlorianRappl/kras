import { basename } from 'path';
import { KrasInjectorOption, Dict } from '../types';

export interface FileInfo {
  active: boolean;
  error?: string;
}

export interface DescribeEntry<T> {
  (item: T, file: string, index: number): string;
}

function getFile(files: Dict<FileInfo>, fileName: string) {
  const file = files[fileName];
  return {
    id: Buffer.from(fileName).toString('base64'),
    name: fileName,
    basename: basename(fileName),
    active: file.active,
    error: file.error,
  };
}

function getEntry<T extends FileInfo>(files: Dict<Array<T>>, fileName: string, desc: DescribeEntry<T>) {
  return {
    id: Buffer.from(fileName).toString('base64'),
    name: fileName,
    basename: basename(fileName),
    entries: files[fileName].map((entry, i) => ({
      active: entry.active,
      error: entry.error,
      description: desc(entry, fileName, i),
    })),
  };
}

export function editDirectoryOption(directories: Array<string>): KrasInjectorOption {
  return {
    description: `Select the directories to inspect for matching files.`,
    title: 'Source Directories',
    type: 'directory',
    value: directories,
  };
}

export function editFileOption(files: Dict<FileInfo>): KrasInjectorOption {
  return {
    description: `Toggle or modify the found files without using an external text editor.`,
    title: 'Found Files',
    type: 'file',
    value: Object.keys(files).map((fileName) => getFile(files, fileName)),
  };
}

export function editEntryOption<T extends FileInfo>(files: Dict<Array<T>>, desc: DescribeEntry<T>): KrasInjectorOption {
  return {
    description: `Modify the found files without using an external text editor or toggle their entries.`,
    title: 'Found Files & Entries',
    type: 'entry',
    value: Object.keys(files).map((fileName) => getEntry(files, fileName, desc)),
  };
}
