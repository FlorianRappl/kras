# JSON Injector

While the HAR injector is already building upon a JSON-based format, the JSON injector also follows this way, however, with a more generic (and easier to write / maintain) format.

A JSON file is defined via the following type:

```ts
type KrasJsonFile = Array<{
  request: {
    url: string;
    target: string;
    query: {
      [key: string]: string;
    };
    method: string;
    headers: {
      [key: string]: string;
    };
    content: string;
  };
  response: OneOrMore<{
    headers: {
      [key: string]: string;
    };
    status: {
      code: number;
      text?: string;
    };
    url: string;
    redirectUrl?: string;
    content: string;
  }>;
}>
```

where

```ts
type OneOrMore<T> = T | Array<T>;
```

The injector specific configuration can be specified as follows:

```ts
interface JsonInjectorConfiguration {
  active?: boolean;
  directory?: string;
  generator?: boolean;
  generatorLocaleName?: string;
}
```

At the moment there are no unique settings for this injector.
