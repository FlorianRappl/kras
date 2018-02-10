import { asScript, watch } from '../helpers/io';
import { basename } from 'path';
import { editFileOption } from '../helpers/build-options';
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
  [file: string]: boolean;
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

  constructor(options: KrasInjectorConfig & ScriptInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    const directory = options.directory || config.directory;
    this.options = options;
    this.core = core;

    watch(directory, '**/*.js', (ev, file) => {
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

    for (const fileName of fileNames) {
      const item = this.db[fileName];
      options[`_${fileName}`] = editFileOption(fileName);
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
    const entries = Object.keys(options).map(option => ({
      file: option,
      active: options[option],
    }));

    this.setAllEntries(entries);
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

  private setAllEntries(entries: Array<{ file: string, active: boolean }>) {
    for (const entry of entries) {
      const script = this.db[entry.file];

      if (script) {
        script.active = entry.active;
      }
    }
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
