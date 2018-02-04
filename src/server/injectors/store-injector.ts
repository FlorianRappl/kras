import { open, JsonStore } from '../helpers/json-store';
import { resolve } from 'path';
import { Request, Response } from 'express';
import { KrasInjectorOptions, KrasRequest, KrasConfiguration, KrasInjectorConfig, KrasInjector } from '../types';

export interface StoreInjectorConfig {
  directory?: string;
  filename?: string;
}

export interface DynamicStoreInjectorConfig {
  file?: string;
}

interface StoreRequestEntry {
  request: KrasRequest;
  response: {
    status: number;
  };
}

export default class StoreInjector implements KrasInjector {
  private readonly options: KrasInjectorConfig & StoreInjectorConfig;
  private readonly db: JsonStore<StoreRequestEntry>;

  constructor(options: KrasInjectorConfig & StoreInjectorConfig, config: KrasConfiguration) {
    const directory = options.directory || config.directory;
    const today = new Date().toJSON().substr(0, 10);
    this.options = options;
    this.db = open<StoreRequestEntry>(resolve(directory, options.filename || `unknown-requests-${today}.json`));
  }

  getOptions(): KrasInjectorOptions {
    return {
      file: {
        title: 'File location',
        description: 'Location of the file to store the unknown / unhandled requests.',
        type: 'text',
        value: this.db.file,
      },
    };
  }

  setOptions(options: DynamicStoreInjectorConfig): void {
    const { file } = options;

    if (file && file !== this.db.file) {
      this.db.switchTo(file);
    }
  }

  get name() {
    return 'store-injector';
  }

  get active() {
    return this.options.active;
  }

  set active(value: boolean) {
    this.options.active = value;
  }

  handle(request: KrasRequest) {
    this.db.insert({
      request,
      response: {
        status: 404,
      },
    });
  }
}
