# Client

The default management client is a single-page application that was build using React as view layer. It tries to be minimal yet complete.

kras also provides the ability to show other clients at the management endpoint. The configuration contains a `client` property, which (if supplied) should map to the file being served (e.g., `index.html`). The location can be relative to the base directory specific in the configuration (falls back to the current working directory if missing).

In the following the management endpoint is always referred to as `/manage`. Keep in mind that this endpoint is free to configure and may therefore be different in general.

Besides the [management API](manage-api.md) for retrieving or setting data the following remarks are important:

- At `/manage` only the explicitly given client is served (usually some index.html file, e.g., *~/foo/bar/index.html*)
- All other files are served via `/manage/static` falling back to the directory where the client is specified (e.g., *~/foo/bar/*)

The last one is particularly important. It means that any file should retrieved in a relative path, i.e., `static/{file}`, not with absolute paths. Furthermore, running HTTP(s) requests are not that easy as well. Not only is the protocol not fixed (could be either HTTPS or HTTP), the path is also unknown.

The following snippet helps to dynamically create an URL based on the information from the management endpoint.

```js
function fullUrl(url, query) {
  const path = location.origin + location.pathname + url;
  return query ? `${path}?${query}` : path;
}
```

Keep in mind that for WebSocket the decision also had to be made between secure and normal websockets.
