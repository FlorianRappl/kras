import { asJson, watch, Watcher } from '../helpers/io';
import { editDirectoryOption, editEntryOption } from '../helpers/build-options';
import { basename } from 'path';
import { fromJson } from '../helpers/build-response';
import { compareRequests } from '../helpers/compare-requests';
import { KrasInjectorConfig, KrasResponse, KrasAnswer, KrasInjector, KrasConfiguration, KrasRequest, Headers, StoredFileEntry, KrasInjectorOptions } from '../types';

function find(response: KrasAnswer | Array<KrasAnswer>) {
  if (Array.isArray(response)) {
    const index = Math.floor(Math.random() * response.length);
    return response[index];
  }

  return response;
}

interface JsonFileItem {
  active: boolean;
  request: KrasRequest;
  response: KrasAnswer | Array<KrasAnswer>;
}

interface JsonFiles {
  [file: string]: Array<JsonFileItem>;
}

export interface JsonInjectorConfig {
  directory?: string | Array<string>;
}

export interface DynamicJsonInjectorConfig {
  [id: string]: boolean;
}

export default class JsonInjector implements KrasInjector {
  private readonly files: JsonFiles = {};
  private readonly options: KrasInjectorConfig & JsonInjectorConfig;
  private readonly watcher: Watcher;

  constructor(options: KrasInjectorConfig & JsonInjectorConfig, config: { directory: string }) {
    const directory = options.directory || config.directory;
    this.options = options;

    this.watcher = watch(directory, '**/*.json', (ev, fileName) => {
      switch (ev) {
        case 'create':
        case 'update':
          return this.load(fileName);
        case 'delete':
          delete this.files[fileName];
          return;
      }
    });
  }

  getOptions(): KrasInjectorOptions {
    return {
      directories: editDirectoryOption(this.watcher.directories),
      entries: editEntryOption(this.files, ({ request }) => `${request.method} ${request.url}`),
    };
  }

  setOptions(options: DynamicJsonInjectorConfig): void {
    const directories = [...this.watcher.directories];

    for (const option of Object.keys(options)) {
      const script = this.files[option];
      const value = options[option];

      if (option.indexOf('#') > 0 && typeof value === 'boolean') {
        const file = option.substr(0, option.indexOf('#'));
        const items = this.files[file];

        if (items) {
          const id = +option.substr(option.indexOf('#') + 1);
          const item = items[id];

          if (item) {
            item.active = value;
          }
        }
      } else if (typeof value === 'string') {
        const index = directories.indexOf(option);

        if (index !== -1) {
          directories[index] = value;
        }
      }
    }

    this.watcher.directories = directories;
  }

  get name() {
    return 'json-injector';
  }

  get active() {
    return this.options.active;
  }

  set active(value: boolean) {
    this.options.active = value;
  }

  private load(fileName: string) {
    const content = asJson(fileName);
    const items = Array.isArray(content) ? content : [content];

    for (const item of items) {
      item.active = true;

      if (typeof(item.request) !== 'object') {
        item.request = {};
      }

      if (typeof(item.response) !== 'object') {
        item.response = {};
      }
    }

    this.files[fileName] = items;
  }

  handle(req: KrasRequest) {
    for (const fileName of Object.keys(this.files)) {
      const entries = this.files[fileName];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (entry.active) {
          const request = entry.request;

          if (compareRequests(request, req)) {
            const response = find(entry.response);
            const name = this.name;
            return fromJson(
              request.url,
              response.status.code,
              response.status.text,
              response.headers,
              response.content, {
                name,
                file: {
                  name: fileName,
                  entry: i,
                },
              });
          }
        }
      }
    }
  }
}
