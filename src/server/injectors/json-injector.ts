import { asJson, watch } from '../helpers/io';
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
  directory?: string;
}

export interface DynamicJsonInjectorConfig {

}

export default class JsonInjector implements KrasInjector {
  private readonly db: JsonFiles = {};
  private readonly options: KrasInjectorConfig & JsonInjectorConfig;

  constructor(options: KrasInjectorConfig & JsonInjectorConfig, config: KrasConfiguration) {
    const directory = options.directory || config.directory;
    this.options = options;

    watch(options.directory, '**/*.json', (ev, file) => {
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
    return {};
  }

  setOptions(options: DynamicJsonInjectorConfig): void {
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

  private getAllEntries() {
    const fileNames = Object.keys(this.db);
    const entries: Array<StoredFileEntry> = [];

    for (const fileName of fileNames) {
      const items = this.db[fileName];

      for (const item of items) {
        entries.push({
          active: item.active,
          file: fileName,
          method: item.request.method,
          url: item.request.url,
        });
      }
    }

    return entries;
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
