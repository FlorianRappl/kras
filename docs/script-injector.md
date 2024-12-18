# Script Injector

The script injector allows using Node modules to dynamically respond to a request. In order to work as intended each script is a Node module that exports a single function, which takes up to three arguments (a context variable containing *extended* settings of the script injector), the current request, as well as the response builder.

## Basic Usage

A simple "hello world"-like example looks as follows:

```js
module.exports = function (ctx, req, res) {
  return res({
    content: `Hello World coming from ${req.url}!`,
  });
};
```

It is important to return either a `Promise` resolving with the result of calling the response builder or directly the response. If nothing (i.e., undefined) is returned, then the next script (or injector) is being tried.

Instead of the CommonJS syntax used in the example above a file could also have an `mjs` extension (i.e., instead of `example.js` it's named `example.mjs`), which allows using ESM syntax:

```js
export default function (ctx, req, res) {
  return res({
    content: `Hello World coming from ${req.url}!`,
  });
};
```

Since these scripts are standard Node modules, we are free to `require` any stuff we'd like to. Other files or installed modules.

## Configuration

The configuration of the script injector is defined to be:

```ts
interface ScriptInjectorConfiguration {
  active?: boolean;
  directory?: string;
  extended?: {
    [key: string]: any;
  };
}
```

The extended part is (shallow) cloned and send as context (first argument) into the script files. The second argument is the standard `KrasRequest` object.

The interface for the response builder is defined to be:

```ts
interface ScriptInjectorResponseBuilder {
  (data: {
    statusCode?: number;
    statusText?: string;
    headers?: {
      [key: string]: string;
    };
    content?: string;
  }): KrasResponse;
}
```

The directory with the script files is watched, such that any change is trigger an evaluation of the changed file, which is then either removed, replaced, or added. Evaluation errors are shown in the client interface.

## Advanced Details

The signature of the function in a script is:

```ts
interface Script {
  (ctx: ScriptContextData, req: KrasRequest, builder: ScriptResponseBuilder):
    | KrasAnswer
    | Promise<KrasAnswer>
    | undefined;
  setup?(ctx: ScriptContextData): void;
  teardown?(ctx: ScriptContextData): void;
  connected?(ctx: ScriptContextData, e: KrasWebSocketEvent): void | boolean;
  disconnected?(ctx: ScriptContextData, e: KrasWebSocketEvent): void;
}
```

where

```ts
export interface ScriptContextData {
  $server: EventEmitter;
  $options: ScriptInjectorConfig;
  $config: KrasConfiguration;
  [prop: string]: any;
}

export interface ScriptInjectorConfig {
  /**
   * Determins if the injector is active.
   */
  active: boolean;
  /**
   * Optionally sets the targets to ignore.
   * Otherwise, no targets are ignored.
   */
  ignore?: Array<string>;
  /**
   * Optionally sets explicitly the targets to handle.
   * Otherwise, all targets are handled.
   */
  handle?: Array<string>;
  /**
   * Optionally sets the base dir of the injector, i.e.,
   * the directory where the injector could be found.
   */
  baseDir?: string;
  /**
   * The directories where the scripts are located.
   */
  directory?: string | Array<string>;
  /**
   * The extended configuration that is forwarded / can be used by the scripts.
   */
  extended?: Record<string, any>;
  /**
   * Defines some additional configurations which are then
   * handled by the specific injector.
   */
  [config: string]: any;
}

export interface KrasRequest {
  /**
   * Indicates if the request has been encrypted.
   */
  encrypted: boolean;
  /**
   * The remote address triggering the request.
   */
  remoteAddress: string;
  /**
   * The port used for the request.
   */
  port: string;
  /**
   * The URL used for the request.
   */
  url: string;
  /**
   * The target path of the request.
   */
  target: string;
  /**
   * The query parameters of the request.
   */
  query: KrasRequestQuery;
  /**
   * The method to trigger the request.
   */
  method: string;
  /**
   * The headers used for the request.
   */
  headers: IncomingHttpHeaders;
  /**
   * The content of the request.
   */
  content: string | FormData;
  /**
   * The raw content of the request.
   */
  rawContent: Buffer;
  /**
   * The form data, in case a form was given.
   */
  formData?: FormData;
}

export interface ScriptResponseBuilder {
  (data: ScriptResponseBuilderData): KrasAnswer;
}

export type Headers = Dict<string | Array<string>>;

export interface ScriptResponseBuilderData {
  statusCode?: number;
  statusText?: string;
  headers?: Headers;
  content?: string;
}

export interface KrasInjectorInfo {
  name?: string;
  host?: {
    target: string;
    address: string;
  };
  file?: {
    name: string;
    entry?: number;
  };
}

export interface KrasAnswer {
  headers: Headers;
  status: {
    code: number;
    text?: string;
  };
  url: string;
  redirectUrl?: string;
  content: string | Buffer;
  injector?: KrasInjectorInfo;
}
```

This allows also specifying `connected` and `disconnected` functions to handle WebSocket connections. If `connected` returns a truthy value then other scripts won't be bothered with `connected`.

The `setup` and `teardown` functions are used to properly initialize or dispose relevant resources. They are called when the script is first discovered or removed / replaced, e.g., in case of a file change.
