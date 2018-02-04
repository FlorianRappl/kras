import { Dict } from './kras-basics';

export interface KrasInjectorStringOption {
  type: 'text';
  value: string;
}

export interface KrasInjectorCheckboxOption {
  type: 'checkbox';
  value: boolean;
}

export type KrasInjectorValueOption = KrasInjectorStringOption | KrasInjectorCheckboxOption;

export type KrasInjectorOption = {
  title: string;
  description: string;
} & KrasInjectorValueOption;

export type KrasInjectorOptions = Dict<KrasInjectorOption>;
