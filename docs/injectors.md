# Injectors

In this document injectors are described from a technical point of view.

## Injector API

Every injector needs to implement the following API:

```typescript
interface KrasInjector {
  active: boolean;
  readonly name: string;
  readonly handle: KrasRequestHandler;
  getOptions(): KrasInjectorOptions;
  setOptions(options: Dict<any>): void;
}
```

Optionally, a cleanup function can be introduced. Be sure to implement it when you would leave handles open (e.g., if you use a file watcher):

```typescript
interface KrasInjector {
  dispose?(): void
}
```

If the injector is developed with TypeScript then kras can simply be used as a development dependency. The types used here are then all available via standard imports from kras, i.e.,

```typescript
import { KrasInjector } from 'kras';

export default class MyInjector implements KrasInjector {
  // ...
}
```

The injector has to be the default export of the module. The constructor of the class will always be called with 3 arguments:

- `options`, the *runtime* options of the injector to construct
- `config`, the *runtime* configuration of the current server instance
- `server`, the running server instance, which is an `EventEmitter` instance

The most important function to implement of the `KrasInjector` interface is called `handle`, it is of type `KrasRequestHandler`. The interface is quite simple:

```typescript
interface KrasRequestHandler {
  (req: KrasRequest): Promise<KrasAnswer> | KrasAnswer | void;
}
```

Thus the injector can either return nothing (next injector will be probed), or a `KrasAnswer`, which may be also given packaged as a promise. In simple words: If we return something kras will expects us to have an answer to the request.

## Writing Local Injectors

Injectors can be written and tested in *any* codebase - or even without a codebase when running kras as a global tool.

The following locations will be searched for an injector (in order):

- The directory specified in the configuration
- The current working directory (i.e., if kras is run from the home directory an injector could be found there)
- The injectors directory of the kras distributable (all default injectors are there)

As a consequence *every* included injector can be shadowed.

It is important to **know the naming convention** when writing a new injector. Every injector module needs to follow the `{name}-injector` rule, i.e., that, e.g., the script injector (referred to as `script`) is in fact called `script-injector` (specified in a file called *script-injector.js*).

## Testing Injectors

Since an injector is just a NPM package testing is as simple as installing, e.g., Jest, and writing / performing some unit tests (no need to mock kras or similar; just test the exported class and potentially any helpers you find interesting).

Nevertheless, naturally you may want to do some exploratory testing with the real thing. If you run `kras` (or via a script, e.g., `npm run kras`) from the project's root directory (containing a package.json) you will automatically use the current injector in the primary spot. Testing the configuration options for the current injector can be done by modifying the custom field `krasOptions` in the package.json, e.g.,

```json
{
  "name": "kras-mytest-injector",
  "version": "1.0.0",
  "description": "As example injector.",
  "main": "dist/index.js",
  "krasOptions": {
    "option1": "...",
    ...
  },
  ...
}
```

Note that these options **do not reflect default options**; they are ignored when importing the injector later on. Furthermore, most importantly the name has to match the injector convention for qualifying.

Another important aspect is the `main` field. If the injector is not stored as *index.js* in the project's directory then the (package.json-relative) path needs to be given here.

## Publishing Injectors

The preferred naming conventions for NPM packages is `kras-{name}-injector`. Besides the primary name there are alternatives. The full is given as:

- `kras-{name}-injector`
- `{name}-kras-injector`
- `{name}-injector`

The last one just follows the standard module convention. However, note that kras should definitely be in the module name to have guaranteed compatibility for future releases.

Make sure to also follow the checklist before publishing a kras injector:

- Do not have a dependency to kras
- A dev dependency to kras is allowed
- A peer dependency to kras should be introduced if `kras/utils` is imported (use `>=0.4.1` or similar as condition)
- Include the "kras" tag (in keywords section); potentially, also "injector" makes sense
- Make sure to allow other injectors to follow up
