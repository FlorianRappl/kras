import { asScript, watch, Watcher } from '../helpers/io';
import { basename } from 'path';
import { editFileOption, editDirectoryOption } from '../helpers/build-options';
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
  extended: string;
  directories: Array<string>;
  files: Array<{
    name: string;
    active: boolean;
  }>;
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
  private readonly files: ScriptFiles = {};
  private readonly options: KrasInjectorConfig & ScriptInjectorConfig;
  private readonly core: EventEmitter;
  private readonly watcher: Watcher;

  constructor(options: KrasInjectorConfig & ScriptInjectorConfig, config: { directory: string }, core: EventEmitter) {
    const directory = options.directory || config.directory;
    this.options = options;
    this.core = core;

    this.watcher = watch(directory, '**/*.js', (ev, fileName) => {
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
      files: editFileOption(this.files),
      extended: {
        description: 'The options available to all script files via the context argument.',
        title: 'Extended Configuration',
        type: 'json',
        value: JSON.stringify(this.options.extended || {}, null, 2),
      },
    };
  }

  setOptions(options: DynamicScriptInjectorConfig): void {
    for (const file of options.files) {
      const script = this.files[file.name];
      const active = file.active;

      if (script && typeof active === 'boolean') {
        script.active = active;
      }
    }

    this.options.extended = JSON.parse(options.extended || '{}');
    this.watcher.directories = options.directories;
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

  private load(fileName: string) {
    const script = this.files[fileName] || {
      active: true,
    };

    script.file = fileName;
    tryEvaluate(script);

    if (script.error) {
      this.core.emit('error', script.error);
    }

    this.files[fileName] = script;
  }

  handle(req: KrasRequest) {
    for (const fileName of Object.keys(this.files)) {
      const script = this.files[fileName];
      const name = this.name;

      if (script.active) {
        const handler = script.handler;
        const builder = ({ statusCode = 200, statusText = '', headers = {}, content = '' }) => fromJson(req.url, statusCode, statusText, headers, content, {
          name,
          file: {
            name: fileName,
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
