import { Dict } from './kras-basics';

export interface KrasInjectorStringOption {
  type: 'text';
  value: string;
}

export interface KrasInjectorCheckboxOption {
  type: 'checkbox';
  value: boolean;
}

export interface KrasInjectorFileOption {
  type: 'file';
  value: Array<{
    id: string;
    name: string;
    basename: string;
    active: boolean;
    error?: string;
  }>;
}

export interface KrasInjectorDirectoryOption {
  type: 'directory';
  value: Array<string>;
}

export interface KrasInjectorEntryOption {
  type: 'entry';
  value: Array<{
    id: string;
    name: string;
    basename: string;
    entries: Array<{
      active: boolean;
      description: string;
      error?: string;
    }>;
  }>;
}

export interface KrasInjectorJsonOption {
  type: 'json';
  value: string;
}

export type KrasInjectorValueOption =
  | KrasInjectorStringOption
  | KrasInjectorCheckboxOption
  | KrasInjectorFileOption
  | KrasInjectorDirectoryOption
  | KrasInjectorEntryOption
  | KrasInjectorJsonOption;

export type KrasInjectorOption = {
  title: string;
  description: string;
} & KrasInjectorValueOption;

export type KrasInjectorOptions = Dict<KrasInjectorOption>;
