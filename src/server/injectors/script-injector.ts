import { EventEmitter } from 'events';
import { asScript, watch, Watcher, editFileOption, editDirectoryOption, fromJson } from '../helpers';
import {
  KrasRequest,
  KrasInjectorConfig,
  KrasInjector,
  KrasAnswer,
  KrasInjectorOptions,
  ScriptResponseBuilder,
  KrasConfiguration,
} from '../types';

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

export interface ScriptFileEntry {
  active: boolean;
  file?: string;
  error?: string;
  handler?(
    ctx: ScriptContextData,
    req: KrasRequest,
    builder: ScriptResponseBuilder,
  ): KrasAnswer | Promise<KrasAnswer> | undefined;
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
  private readonly core: EventEmitter;
  private readonly watcher: Watcher;

  public config: KrasInjectorConfig & ScriptInjectorConfig;
  public krasConfig: KrasConfiguration;

  constructor(options: KrasInjectorConfig & ScriptInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    const directory = options.directory || config.sources || config.directory;
    this.config = options;
    this.core = core;
    this.krasConfig = config;

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
        value: JSON.stringify(this.config.extended || {}, undefined, 2),
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

    this.config.extended = JSON.parse(options.extended || '{}');
    this.watcher.directories = options.directories;
  }

  get name() {
    return 'script-injector';
  }

  get active() {
    return this.config.active;
  }

  set active(value: boolean) {
    this.config.active = value;
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

  dispose() {
    this.watcher.close();
  }

  handle(req: KrasRequest): Promise<KrasAnswer> | KrasAnswer {
    for (const fileName of Object.keys(this.files)) {
      const script = this.files[fileName];
      const name = this.name;

      if (script.active) {
        const handler = script.handler;
        const builder = ({ statusCode = 200, statusText = '', headers = {}, content = '' }) =>
          fromJson(req.url, statusCode, statusText, headers, content, {
            name,
            file: {
              name: fileName,
            },
          });
        const extended = this.config.extended || {};
        const ctx = {
          $server: this.core,
          $options: this.config,
          $config: this.krasConfig,
          ...extended,
        };
        const res = handler(ctx, req, builder);

        if (res) {
          return res;
        }
      }
    }
  }
}
