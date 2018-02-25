import { asJson, watch, Watcher } from '../helpers/io';
import { editDirectoryOption, editEntryOption } from '../helpers/build-options';
import { basename } from 'path';
import { fromJson } from '../helpers/build-response';
import { compareRequests } from '../helpers/compare-requests';
import { KrasInjectorConfig, KrasResponse, KrasAnswer, KrasInjector, KrasConfiguration, KrasRequest, Headers, StoredFileEntry, KrasInjectorOptions } from '../types';

function find(response: KrasAnswer | Array<KrasAnswer>, randomize: boolean) {
  if (Array.isArray(response)) {
    const index = randomize ? Math.floor(Math.random() * response.length) : 0;
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
  randomize?: boolean;
}

export interface DynamicJsonInjectorConfig {
  randomize: boolean;
  directories: Array<string>;
  files: Array<{
    name: string;
    entries: Array<{
      active: boolean;
    }>;
  }>;
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
      randomize: {
        description: `If active randomizes the selected response. Only applicable in case where multiple responses are found for a given request.`,
        title: `Randomize Response`,
        type: 'checkbox',
        value: this.options.randomize || false,
      },
      directories: editDirectoryOption(this.watcher.directories),
      files: editEntryOption(this.files, ({ request }) => `${request.method} ${request.url}`),
    };
  }

  setOptions(options: DynamicJsonInjectorConfig): void {
    this.options.randomize = options.randomize;

    for (const file of options.files) {
      const entries = this.files[file.name];

      if (entries) {
        for (let i = 0; i < entries.length; i++) {
          const entry = file.entries[i];

          if (entry && typeof entry.active === 'boolean') {
            entries[i].active = entry.active;
          }
        }
      }
    }

    this.watcher.directories = options.directories;
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
            const rand = this.options.randomize;
            const response = find(entry.response, rand);
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
