import { asScript, watch, Watcher, editFileOption, editDirectoryOption, fromJson } from '../helpers';
import type { EventEmitter } from 'events';
import type {
  KrasRequest,
  KrasInjectorConfig,
  KrasInjector,
  KrasAnswer,
  KrasInjectorOptions,
  ScriptResponseBuilder,
  KrasConfiguration,
  KrasWebSocketEvent,
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

export interface ScriptExports {
  (
    ctx: ScriptContextData,
    req: KrasRequest,
    builder: ScriptResponseBuilder,
  ): KrasAnswer | Promise<KrasAnswer> | undefined;
  setup?(ctx: ScriptContextData): void;
  teardown?(ctx: ScriptContextData): void;
  connected?(ctx: ScriptContextData, e: KrasWebSocketEvent): void | boolean;
  disconnected?(ctx: ScriptContextData, e: KrasWebSocketEvent): void;
}

export interface ScriptFileEntry {
  path: string;
  active: boolean;
  error?: string;
  handler?: ScriptExports;
}

type ScriptFiles = Array<ScriptFileEntry>;

export async function tryEvaluate(script: ScriptFileEntry, ctx: ScriptContextData) {
  try {
    const handler = await asScript(script.path);

    if (typeof handler !== 'function') {
      throw new Error('Does not export a function - it will be ignored.');
    }

    if (typeof handler?.setup === 'function') {
      handler.setup(ctx);
    }

    script.error = undefined;
    script.handler = handler;
  } catch (e) {
    script.error = e;
    script.handler = errorHandler;
  }
}

export default class ScriptInjector implements KrasInjector {
  private readonly files: ScriptFiles = [];
  private readonly core: EventEmitter;
  private readonly watcher: Watcher;

  public config: KrasInjectorConfig & ScriptInjectorConfig;
  public krasConfig: KrasConfiguration;

  constructor(options: KrasInjectorConfig & ScriptInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    const directory = options.directory || config.sources || config.directory;
    this.config = options;
    this.core = core;
    this.krasConfig = config;

    this.watcher = watch(directory, ['.js', '.mjs', '.cjs'], (ev, fileName) => {
      switch (ev) {
        case 'create':
        case 'update':
          return this.load(fileName);
        case 'delete':
          return this.unload(fileName);
      }
    });

    core.on('user-connected', (e: KrasWebSocketEvent) => {
      if (!e.handled) {
        for (const { handler } of this.files) {
          if (handler && typeof handler.connected === 'function') {
            const ctx = this.getContext();

            try {
              if (handler.connected(ctx, e)) {
                e.handled = true;
                break;
              }
            } catch (err) {
              core.emit('error', err);
            }
          }
        }
      }
    });

    core.on('user-disconnected', (e: KrasWebSocketEvent) => {
      for (const { handler } of this.files) {
        if (handler && typeof handler.disconnected === 'function') {
          const ctx = this.getContext();

          try {
            handler.disconnected(ctx, e);
          } catch (err) {
            core.emit('error', err);
          }
        }
      }
    });
  }

  private getContext(): ScriptContextData {
    const extended = this.config.extended || {};
    return {
      $server: this.core,
      $options: this.config,
      $config: this.krasConfig,
      ...extended,
    };
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
    for (const { name, active } of options.files) {
      const script = this.files.find((f) => f.path === name);

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

  private unload(fileName: string) {
    const index = this.files.findIndex(({ path }) => path === fileName);

    if (index !== -1) {
      const file = this.files[index];
      const handler = file.handler;

      if (typeof handler?.teardown === 'function') {
        const ctx = this.getContext();

        try {
          handler.teardown(ctx);
        } catch (err) {
          this.core.emit('error', err);
        }
      }

      this.files.splice(index, 1);
    }
  }

  private async load(fileName: string) {
    const file = this.files.find(({ path }) => path === fileName);
    const active = file?.active ?? true;
    const script: ScriptFileEntry = { path: fileName, active };
    const ctx = this.getContext();

    if (file) {
      this.unload(fileName);
    }

    await tryEvaluate(script, ctx);

    if (script.error) {
      this.core.emit('error', script.error);
    } else {
      this.files.push(script);
    }
  }

  dispose() {
    this.watcher.close();
  }

  handle(req: KrasRequest): Promise<KrasAnswer> | KrasAnswer {
    for (const { path, active, handler } of this.files) {
      const name = this.name;

      if (active) {
        const builder = ({ statusCode = 200, statusText = '', headers = {}, content = '' }) =>
          fromJson(req.url, statusCode, statusText, headers, content, {
            name,
            file: {
              name: path,
            },
          });
        const ctx = this.getContext();

        try {
          const res = handler(ctx, req, builder);

          if (res) {
            return res;
          }
        } catch (err) {
          this.core.emit('error', err);
        }
      }
    }
  }
}
