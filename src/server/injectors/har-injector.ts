import type FormData from 'form-data';
import {
  asJson,
  watch,
  Watcher,
  editDirectoryOption,
  editEntryOption,
  fromHar,
  HarResponse,
  HarRequest,
  HarHeaders,
  compareRequests,
} from '../helpers';
import type {
  KrasInjector,
  KrasInjectorConfig,
  KrasRequest,
  Headers,
  KrasInjectorOptions,
  KrasAnswer,
  KrasConfiguration,
} from '../types';

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

  for (const item of arr || []) {
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
  };
}

interface HttpArchive {
  active: boolean;
  request: HarRequest;
  response: HarResponse;
  time: number;
}

interface HarFileEntry {
  path: string;
  active: boolean;
  request: {
    method: string;
    url: string;
    target: string;
    content: string;
    rawContent: any;
    formData?: FormData;
    headers: Headers;
    query: Headers;
  };
  response: HarResponse;
  time: number;
}

type HarFiles = Array<Array<HarFileEntry>>;

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
  private readonly files: HarFiles = [];
  private readonly watcher: Watcher;
  private readonly connectors: Array<{
    target: string;
    address: string;
  }>;

  public config: KrasInjectorConfig & HarInjectorConfig;

  constructor(options: KrasInjectorConfig & HarInjectorConfig, config: KrasConfiguration) {
    const directory = options.directory || config.sources || config.directory;
    this.config = options;
    this.connectors = Object.keys(config.map)
      .filter((target) => config.map[target] !== false)
      .map((target) => ({
        target,
        address: config.map[target] as string,
      }));

    this.watcher = watch(directory, ['.har'], (ev, fileName) => {
      switch (ev) {
        case 'create':
        case 'update':
          return this.load(fileName);
        case 'delete':
          return this.unload(fileName);
      }
    });
  }

  getOptions(): KrasInjectorOptions {
    return {
      delay: {
        description: `If active delays the responses with the time it took according to the HAR.`,
        title: `Delay Responses`,
        type: 'checkbox',
        value: this.config.delay || false,
      },
      directories: editDirectoryOption(this.watcher.directories),
      files: editEntryOption(this.files, ({ request }) => `${request.method} ${request.url}`),
    };
  }

  setOptions(options: DynamicHarInjectorConfig): void {
    this.config.delay = options.delay;

    for (const { name, entries } of options.files) {
      const files = this.files.find((m) => m[0].path === name);

      if (entries) {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const file = files[i];

          if (file && typeof entry.active === 'boolean') {
            file.active = entry.active;
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
    return this.config.active;
  }

  set active(value: boolean) {
    this.config.active = value;
  }

  private unload(fileName: string) {
    const index = this.files.findIndex((m) => m[0].path === fileName);

    if (index !== -1) {
      this.files.splice(index, 1);
    }
  }

  private load(fileName: string) {
    const content = asJson(fileName, undefined);
    const entries = findEntries(content);
    const files = entries.map((entry) => this.transformEntry(fileName, entry));
    this.unload(fileName);

    if (files.length > 0) {
      this.files.push(files);
    }
  }

  private findTarget(url: string) {
    for (const { target, address } of this.connectors) {
      if (url.indexOf(address) === 0) {
        return target;
      }
    }

    return undefined;
  }

  private transformEntry(path: string, entry: HttpArchive) {
    const original = entry.request;
    const response = entry.response;
    const content = (original.postData || {}).text || '';
    const request = {
      method: original.method,
      url: getUrl(original.url),
      target: original.target || this.findTarget(original.url),
      content,
      rawContent: content,
      headers: ato(original.headers),
      query: ato(original.queryString),
    };

    delete request.headers._;

    return {
      path,
      active: true,
      time: entry.time,
      request,
      response,
    };
  }

  dispose() {
    this.watcher.close();
  }

  handle(req: KrasRequest): Promise<KrasAnswer> | KrasAnswer {
    let i = 0;

    for (const files of this.files) {
      for (const { path, active, time, request, response } of files) {
        if (active) {
          const name = this.name;

          if (compareRequests(request, req)) {
            return delay(
              fromHar(request.url, response, {
                name,
                file: {
                  name: path,
                  entry: i,
                },
              }),
              this.config.delay && time,
            );
          }
        }

        i++;
      }
    }
  }
}
