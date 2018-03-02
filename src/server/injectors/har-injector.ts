import { asJson, watch, Watcher } from '../helpers/io';
import { basename } from 'path';
import { editDirectoryOption, editEntryOption } from '../helpers/build-options';
import { fromHar, HarResponse, HarRequest, HarHeaders } from '../helpers/build-response';
import { compareRequests } from '../helpers/compare-requests';
import { KrasInjector, KrasInjectorConfig, KrasConfiguration, KrasRequest, KrasAnswer, Headers, StoredFileEntry, KrasInjectorOptions, Dict } from '../types';

function delay<T>(value: T, time: number) {
  if (time) {
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => resolve(value), time);
    });
  }

  return value;
}

function ato(arr: HarHeaders) {
  const obj: Headers = {};

  for (const item of (arr || [])) {
    obj[item.name] = item.value;
  }

  return obj;
}

function getUrl(url: string) {
  if (url.startsWith('http')) {
    return url.substr(url.indexOf('/', 9));
  }

  return url;
}

function findEntries(obj: HarContent) {
  if (typeof obj === 'object' && obj.log && Array.isArray(obj.log.entries)) {
    return obj.log.entries;
  }

  return [];
}

interface HarContent {
  log?: {
    entries?: Array<HttpArchive>;
  }
}

interface HttpArchive {
  active: boolean;
  request: HarRequest;
  response: HarResponse;
  time: number;
}

interface HarFileEntry {
  active: boolean;
  request: {
    method: string;
    url: string;
    target: string;
    content: string;
    headers: Headers;
    query: Headers;
  };
  response: HarResponse;
  time: number;
}

interface HarFiles {
  [file: string]: Array<HarFileEntry>;
}

export interface HarInjectorConfig {
  directory?: string | Array<string>;
  delay?: boolean;
}

export interface DynamicHarInjectorConfig {
  delay: boolean;
  directories: Array<string>;
  files: Array<{
    name: string;
    entries: Array<{
      active: boolean;
    }>;
  }>;
}

export default class HarInjector implements KrasInjector {
  private readonly files: HarFiles = {};
  private readonly options: KrasInjectorConfig & HarInjectorConfig;
  private readonly map: {
    [target: string]: string;
  };
  private readonly watcher: Watcher;

  constructor(options: KrasInjectorConfig & HarInjectorConfig, config: { directory: string, map: Dict<string> }) {
    const directory = options.directory || config.directory;
    this.options = options;
    this.map = config.map;

    this.watcher = watch(directory, '**/*.har', (ev, fileName) => {
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
      delay: {
        description: `If active delays the responses with the time it took according to the HAR.`,
        title: `Delay Responses`,
        type: 'checkbox',
        value: this.options.delay || false,
      },
      directories: editDirectoryOption(this.watcher.directories),
      files: editEntryOption(this.files, ({ request }) => `${request.method} ${request.url}`),
    };
  }

  setOptions(options: DynamicHarInjectorConfig): void {
    this.options.delay = options.delay;

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
    return 'har-injector';
  }

  get active() {
    return this.options.active;
  }

  set active(value: boolean) {
    this.options.active = value;
  }

  private load(fileName: string) {
    this.files[fileName] = findEntries(asJson(fileName))
      .map(entry => this.transformEntry(entry));
  }

  private findTarget(url: string) {
    for (const target of Object.keys(this.map)) {
      if (url.indexOf(this.map[target])) {
        return target;
      }
    }

    return undefined;
  }

  private transformEntry(entry: HttpArchive) {
    const original = entry.request;
    const response = entry.response;
    const request = {
      method: original.method,
      url: getUrl(original.url),
      target: original.target || this.findTarget(original.url),
      content: (original.postData || {}).text || '',
      headers: ato(original.headers),
      query: ato(original.queryString),
    };

    delete request.headers['_'];

    return {
      active: true,
      time: entry.time,
      request,
      response,
    };
  }

  dispose() {
    this.watcher.close();
  }

  handle(req: KrasRequest) {
    for (const fileName of Object.keys(this.files)) {
      const entries = this.files[fileName];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (entry.active) {
          const item = entry.request;
          const name = this.name;

          if (compareRequests(item, req)) {
            return delay(fromHar(item.url, entry.response, {
              name,
              file: {
                name: fileName,
                entry: i,
              }
            }), this.options.delay && entry.time);
          }
        }
      }
    }
  }
}
