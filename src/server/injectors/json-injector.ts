import { asJson, watch } from '../helpers/io';
import { editFileOption } from '../helpers/build-options';
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

  constructor(options: KrasInjectorConfig & JsonInjectorConfig, config: KrasConfiguration) {
    const directory = options.directory || config.directory;
    this.options = options;

    watch(directory, '**/*.json', (ev, file) => {
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

    for (const fileName of fileNames) {
      const items = this.db[fileName];
      options[`_${fileName}`] = editFileOption(fileName);

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
    const entries = Object.keys(options).map(option => ({
      file: option.substr(0, option.indexOf('#')),
      id: +option.substr(option.indexOf('#') + 1),
      active: options[option],
    }));

    this.setAllEntries(entries);
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

  private setAllEntries(entries: Array<StoredFileEntry>) {
    for (const entry of entries) {
      const items = this.db[entry.file];

      if (items) {
        const item = items[entry.id];

        if (item) {
          item.active = entry.active;
        }
      }
    }
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
