# Proxy Injector

The proxy injector just redirects the URL part to the server that has the associated target mapping. Let's consider an example to illustrate this concept:

```json
{
  "map": {
    "/foo": "http://foo.com",
    "/bar": "https://bar.com"
  }
}
```

If a request comes into to `/foo/something/page/` and the proxy injector picks it up, it will make a new request to `http://foo.com/something/page/` with the exact same data if transferable. Likewise, a request to `/bar/other/api` will be resolved via `https://bar.com/other/api`. The response will be packed to a corresponding kras response.

The injector configuration is defined as below:

```ts
interface ProxyInjectorConfiguration {
  active?: boolean;
  agentOptions?: any;
  proxy?: any;
  xfwd?: boolean;
  defaultHeaders?: Array<string>;
  discardHeaders?: Array<string>;
  permitHeaders?: Array<string>;
  injectHeaders?: Record<string, string>;
  followRedirect?: boolean;
}
```

The mapping is already a general configuration, as the targets need to be known as well as their usual counterparts (e.g., to identify the correct URLs in an HAR file). The `agentOptions` can be used to specify more sophisticated options for the proxyed request (e.g., which ciphers to use). The `proxy` option allows us to set a (corporate?) proxy to be used on the local machine (oh the irony - a proxy server that allows setting another proxy ...).

While the `defaultHeaders` provide a way to override the used default set of headers, `permitHeaders` are for explicitly allowing non-default headers and `discardHeaders` may be used to define which headers should never be considered, and `injectHeaders` may be used to create or override headers with custom values.

If not explicitly specified the default headers are defined to be:

```js
const defaultProxyHeaders = [
  'authorization',
  'accept',
  'content-type',
  'cookie',
  'accept-language',
  'user-agent',
  'if-match',
  'if-range',
  'if-unmodified-since',
  'if-none-match',
  'if-modified-since',
  'pragma',
  'range',
];
```

The `xfwd` option will create the following headers:
- x-forwarded-for
- x-forwarded-host
- x-forwarded-port
- x-forwarded-proto

and set the header values as derived from the original request. The `x-forwarded-host` header will contain the request's `host` header value, which may include a port number.
