import { asJson, watch, Watcher } from '../helpers/io';
import { appendFileOption, appendDirectoryOptions } from '../helpers/build-options';
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
  private readonly db: JsonFiles = {};
  private readonly options: KrasInjectorConfig & JsonInjectorConfig;
  private readonly watcher: Watcher;

  constructor(options: KrasInjectorConfig & JsonInjectorConfig, config: { directory: string }) {
    const directory = options.directory || config.directory;
    this.options = options;

    this.watcher = watch(directory, '**/*.json', (ev, file) => {
      switch (ev) {
        case 'create':
        case 'update':
          return this.load(file);
        case 'delete':
          delete this.db[file];
          return;
      }
    });
  }

  getOptions(): KrasInjectorOptions {
    const options: KrasInjectorOptions = {};
    const fileNames = Object.keys(this.db);
    appendDirectoryOptions(options, this.watcher.directories);

    for (const fileName of fileNames) {
      const items = this.db[fileName];
      appendFileOption(options, fileName);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const id = `${fileName}#${i}`;
        options[id] = {
          description: `#${i + 1} of ${fileName} - ${item.request.method} ${item.request.url}.`,
          title: basename(fileName),
          type: 'checkbox',
          value: item.active,
        };
      }
    }

    return options;
  }

  setOptions(options: DynamicJsonInjectorConfig): void {
    const directories = [...this.watcher.directories];

    for (const option of Object.keys(options)) {
      const script = this.db[option];
      const value = options[option];

      if (option.indexOf('#') > 0 && typeof value === 'boolean') {
        const file = option.substr(0, option.indexOf('#'));
        const items = this.db[file];

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

  private load(file: string) {
    const content = asJson(file);
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

    this.db[file] = items;
  }

  handle(req: KrasRequest) {
    for (const file of Object.keys(this.db)) {
      const entries = this.db[file];

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
                  name: file,
                  entry: i,
                },
              });
          }
        }
      }
    }
  }
}
