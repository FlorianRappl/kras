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
  value: string;
}

export type KrasInjectorValueOption = KrasInjectorStringOption | KrasInjectorCheckboxOption | KrasInjectorFileOption;

export type KrasInjectorOption = {
  title: string;
  description: string;
} & KrasInjectorValueOption;

export type KrasInjectorOptions = Dict<KrasInjectorOption>;
