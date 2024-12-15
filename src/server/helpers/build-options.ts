import { basename } from 'path';
import { KrasInjectorOption } from '../types';

export interface FileInfo {
  path: string;
  active: boolean;
  error?: string;
}

export interface DescribeEntry<T> {
  (item: T, file: string, index: number): string;
}

function getFile(fileInfo: FileInfo) {
  const fileName = fileInfo.path;
  return {
    id: Buffer.from(fileName).toString('base64'),
    name: fileName,
    basename: basename(fileName),
    active: fileInfo.active,
    error: fileInfo.error,
  };
}

function getEntry<T extends FileInfo>(fileInfos: Array<T>, desc: DescribeEntry<T>) {
  const fileName = fileInfos[0].path;
  return {
    id: Buffer.from(fileName).toString('base64'),
    name: fileName,
    basename: basename(fileName),
    entries: fileInfos.map((entry, i) => ({
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

export function editFileOption(files: Array<FileInfo>): KrasInjectorOption {
  return {
    description: `Toggle or modify the found files without using an external text editor.`,
    title: 'Found Files',
    type: 'file',
    value: files.map((fileInfo) => getFile(fileInfo)),
  };
}

export function editEntryOption<T extends FileInfo>(
  files: Array<Array<T>>,
  desc: DescribeEntry<T>,
): KrasInjectorOption {
  return {
    description: `Modify the found files without using an external text editor or toggle their entries.`,
    title: 'Found Files & Entries',
    type: 'entry',
    value: files.map((subfiles) => getEntry(subfiles, desc)),
  };
}
