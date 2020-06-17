import { asJson, watch, Watcher, editDirectoryOption, editEntryOption, fromJson, compareRequests } from '../helpers';
import { KrasInjectorConfig, KrasAnswer, KrasInjector, KrasRequest, KrasInjectorOptions, KrasConfiguration } from '../types';

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
  private readonly watcher: Watcher;

  public config: KrasInjectorConfig & JsonInjectorConfig;

  constructor(options: KrasInjectorConfig & JsonInjectorConfig, config: KrasConfiguration) {
    const directory = options.directory || config.sources || config.directory;
    this.config = options;

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
        value: this.config.randomize || false,
      },
      directories: editDirectoryOption(this.watcher.directories),
      files: editEntryOption(this.files, ({ request }) => `${request.method} ${request.url}`),
    };
  }

  setOptions(options: DynamicJsonInjectorConfig): void {
    this.config.randomize = options.randomize;

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
    return this.config.active;
  }

  set active(value: boolean) {
    this.config.active = value;
  }

  private load(fileName: string) {
    const content = asJson(fileName);
    const items = Array.isArray(content) ? content : [content];

    for (const item of items) {
      item.active = true;

      if (typeof item.request !== 'object') {
        item.request = {};
      }

      if (typeof item.response !== 'object') {
        item.response = {};
      }
    }

    this.files[fileName] = items;
  }

  dispose() {
    this.watcher.close();
  }

  handle(req: KrasRequest): Promise<KrasAnswer> | KrasAnswer {
    for (const fileName of Object.keys(this.files)) {
      const entries = this.files[fileName];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (entry.active) {
          const request = entry.request;

          if (compareRequests(request, req)) {
            const rand = this.config.randomize;
            const response = find(entry.response, rand);
            const name = this.name;
            return fromJson(
              request.url,
              response.status.code,
              response.status.text,
              response.headers,
              response.content,
              {
                name,
                file: {
                  name: fileName,
                  entry: i,
                },
              },
            );
          }
        }
      }
    }
  }
}
