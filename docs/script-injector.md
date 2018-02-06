# Script Injector

The script injector allows using Node modules to dynamically respond to a request. In order to work as intended each script is a Node module that exports a single function, which takes up to three arguments (a context variable containing *extended* settings of the script injector), the current request, as well as the response builder.

A simple "hello world"-like example looks as follows:

```js
module.exports = function (ctx, req, res) {
  return res({
    content: `Hello World coming from ${req.url}!`,
  });
};
```

It is important to return either a `Promise` resolving with the result of calling the response builder or directly the response. If nothing (i.e., undefined) is returned, then the next script (or injector) is being tried.

Since these scripts are standard Node modules, we are free to `require` any stuff we'd like to. Other files or installed modules.

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
