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
}
```

The mapping is already a general configuration, as the targets need to be known as well as their usual counterparts (e.g., to identify the correct URLs in an HAR file). The `agentOptions` can be used to specify more sophisticated options for the proxyed request (e.g., which ciphers to use). The `proxy` option allows us to set a (corporate?) proxy to be used on the local machine (oh the irony - a proxy server that allows setting another proxy ...).
