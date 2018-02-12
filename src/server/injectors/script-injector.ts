import { asScript, watch, Watcher } from '../helpers/io';
import { basename } from 'path';
import { appendFileOption, appendDirectoryOptions } from '../helpers/build-options';
import { fromJson } from '../helpers/build-response';
import { KrasRequest, KrasConfiguration, Headers, StoredFileEntry, KrasInjectorConfig, KrasInjector, KrasAnswer, KrasInjectorOptions } from '../types';
import { EventEmitter } from 'events';

function errorHandler(): undefined {
  return undefined;
}

export interface ScriptContextData {
  [prop: string]: any;
}

export interface ScriptInjectorConfig {
  directory?: string | Array<string>;
  extended?: ScriptContextData;
}

export interface DynamicScriptInjectorConfig {
  [file: string]: boolean | string;
}

export interface ScriptResponseBuilderData {
  statusCode: number;
  statusText: string;
  headers: Headers;
  content: string;
}

export interface ScriptResponseBuilder {
  (data: ScriptResponseBuilderData): KrasAnswer;
}

export interface ScriptFileEntry {
  active: boolean;
  file?: string;
  error?: string;
  handler?(ctx: ScriptContextData, req: KrasRequest, builder: ScriptResponseBuilder): KrasAnswer | Promise<KrasAnswer> | undefined;
}

interface ScriptFiles {
  [file: string]: ScriptFileEntry;
}

export function tryEvaluate(script: ScriptFileEntry) {
  try {
    const handler = asScript(script.file);

    if (typeof handler !== 'function') {
      throw new Error('Does not export a function - it will be ignored.');
    }

    script.error = undefined;
    script.handler = handler;
  } catch (e) {
    script.error = e;
    script.handler = errorHandler;
  }
}

export default class ScriptInjector implements KrasInjector {
  private readonly db: ScriptFiles = {};
  private readonly options: KrasInjectorConfig & ScriptInjectorConfig;
  private readonly core: EventEmitter;
  private readonly watcher: Watcher;

  constructor(options: KrasInjectorConfig & ScriptInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    const directory = options.directory || config.directory;
    this.options = options;
    this.core = core;

    this.watcher = watch(directory, '**/*.js', (ev, file) => {
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
    const entries: Array<StoredFileEntry> = [];
    appendDirectoryOptions(options, this.watcher.directories);

    for (const fileName of fileNames) {
      const item = this.db[fileName];
      appendFileOption(options, fileName);
      options[fileName] = {
        description: `Status of ${fileName}. ${item.error ? ' ' + item.error : ''}`,
        title: basename(fileName),
        type: 'checkbox',
        value: item.active,
      };
    }

    return options;
  }

  setOptions(options: DynamicScriptInjectorConfig): void {
    const directories = [...this.watcher.directories];

    for (const option of Object.keys(options)) {
      const script = this.db[option];
      const value = options[option];

      if (script && typeof value === 'boolean') {
        script.active = value;
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
    return 'script-injector';
  }

  get active() {
    return this.options.active;
  }

  set active(value: boolean) {
    this.options.active = value;
  }

  private load(file: string) {
    const script = this.db[file] || {
      active: true,
    };

    script.file = file;
    tryEvaluate(script);

    if (script.error) {
      this.core.emit('error', script.error);
    }

    this.db[file] = script;
  }

  handle(req: KrasRequest) {
    for (const file of Object.keys(this.db)) {
      const script = this.db[file];
      const name = this.name;

      if (script.active) {
        const handler = script.handler;
        const builder = ({ statusCode = 200, statusText = '', headers = {}, content = '' }) => fromJson(req.url, statusCode, statusText, headers, content, {
          name,
          file: {
            name: file,
          },
        });
        const extended = this.options.extended || {};
        const ctx = { ...extended };
        const res = handler(ctx, req, builder);

        if (res) {
          return res;
        }
      }
    }
  }
}
