# kras

[![Build Status](https://travis-ci.org/FlorianRappl/kras.svg?branch=master)](https://travis-ci.org/FlorianRappl/kras)
[![npm](https://img.shields.io/npm/v/kras.svg)](https://www.npmjs.com/package/kras)
[![node](https://img.shields.io/node/v/kras.svg)](https://www.npmjs.com/package/kras)
[![GitHub tag](https://img.shields.io/github/tag/FlorianRappl/kras.svg)](https://github.com/FlorianRappl/kras/releases)
[![GitHub issues](https://img.shields.io/github/issues/FlorianRappl/kras.svg)](https://github.com/FlorianRappl/kras/issues)

Efficient server proxying and mocking in Node.js. :muscle:

![kras logo](https://github.com/FlorianRappl/kras/raw/master/logo.png)

The README is supposed to only give you a basic idea what kras *is*. To *truly find out* about all the possibilities and details the [getting started](docs/getting-started.md) document will give you the right pointers and pieces of information.

## Mission Statement

kras is meant to be a swiss army knife for server mocking. It is meant for the development of large web applications that consist of a (decoupled) frontend and backend part (e.g., frontend MVC heavy, like a SPA, backend a (micro) service landscape, potentially behind a gateway).

Some cases where the mocking makes sense:

- Instead of running against real backend systems mock data may be returned (allows development also in offline scenarios)
- No need to wait for proposed BE API changes - can all be done already
- The backend cannot be used during development since localhost is not allowed in CORS
- Authentication is done via, e.g., OAuth, where the redirect to localhost is forbidden
- Users reported a problem and submitted an HAR file with real responses - now we want to replay for debugging purposes

There are countless more scenarios where mocking (or intelligent proxying) makes sense. This can go beyond standard REST, e.g., what if the backend has a websocket endpoint for sending events? kras can help us in such scenarios as well - its websocket proxying also allows us to be in the middle and actively send (i.e., broadcast) data to connected clients. This makes it possible to mock these events in question as well.

One sentence to describe the usage of kras is:

> With kras you can truly decouple the development of frontend and backend. It can be an API server, it can be a static or dynamic proxy, it can be everything you need to bend the backend at your will.

Most importantly, kras supports mocking multiple servers (i.e., hostnames) by path-prefixing them. You'll just need to open a single port for all needs.

## Installation

There are two basic ways to use kras. Either globally installed, i.e.,

```bash
npm i kras -g
```

or locally as a development dependency for your project:

```bash
npm i kras -D
```

While the former may be good in general to play around, the latter should be preferred to actually share / configure kras for the particular project.

Running kras can then be done, e.g., via specifying the `kras` command (global usage) or referring to `kras` via the npm scripts in the *package.json*. kras can also be used programmatically, e.g., in a webpack configuration. The library exports several classes and functions that help you establish a mock server for your project in no time.

## Configuration

kras uses configuration files and command line options to be properly configred. The configuration files are named `.krasrc` and are looked up in the following order: home directory, local directory, via the command line specified configuration file. Configuration options are merged from left to right.

If specified the command line options have higher precendence. The following options exist.

```plain
  -c, --config  Sets the configuration file to use, by default .krasrc  [string]
  -p, --port    Sets the port of the server, by default 9000            [number]
  -n, --name    Sets the name of the server, by default kras v0.1.3     [string]
  -d, --dir     Sets the base directory of the server, by default ...   [string]
  --cert        Sets the certificate of the server, by default ...      [string]
  --key         Sets the key of the server, by default ...              [string]
```

The `.krasrc` is a simple JSON format. An example is the following configuration:

```json
{
  "name": "kras",
  "port": 9000,
  "directory": ".",
  "ssl": {
    "cert": "cert/server.crt",
    "key": "cert/server.key"
  },
  "api": "/manage",
  "map": {
    "/": "https://httpbin.org",
    "/api": "https://jsonplaceholder.typicode.com",
    "/events": "ws://demos.kaazing.com/echo"
  },
  "injectors": {
    "script": {
      "active": true,
      "directory": "db/"
    },
    "har": {
      "active": true,
      "directory": "db/",
      "delay": false
    },
    "json": {
      "active": true,
      "directory": "db/"
    },
    "proxy": {
      "active": true
    },
    "store": {
      "active": false,
      "directory": "db/"
    }
  }
}
```

Directory paths are always resolved to an absolute with respect to the location of the containing configuration file. The injector sections are actually dynamic settings that are transported as-is to the respective injector. An injector is just a request handler, which may know how to get an answer to the current request.

The configuration of kras can also be (partially) changed during runtime using the management endpoint. By default this endpoint can be accessed at `https://localhost:9000/manage`. Please note that the HTTPS could be changed to HTTP (if the ssl option was disabled), the port could be changed, and the endpoint itself could be changed.

## Contributing

We are totally open for contribution and appreciate any feedback, bug reports, or feature requests. More detailed information on contributing incl. a code of conduct are soon to be presented.

## FAQ

*What does kras mean?*

kras is the abbreviation for "kein reiner API server" (German), indicating that kras is actually not (only or exclusively) an API server, but just serving (or proxying) content from an arbitrary server (which could be an API server, of course). Literally, it means "not a pure API server" referring to the number of possibilities for serving *any* HTTP-based content plus websockets.

*Is kras useful for unit and / or integration tests?*

I think so, even though real end-to-end tests should be performed against the real backend. Nevertheless, using kras we can rely on fixed contracts for our backend. Additionally, it allows us to run these tests even when no Internet connection is available. For unit tests the big advantage is that the mocking part is not / has not to be configured within our own code base, but in an external one. This is a little bit more robust against refactorings.

*Can the order of the injectors be changed?*

Yes, totally. The order is given by the order in the JSON defining the different injectors, e.g., swapping two entries in the JSON will result in changing the order of the injectors respectively.

*Why is the server HTTPS by default?*

Normally, API servers in most projects are HTTPS only. Thus the configuration part in standard code may be reduced to a hostname, e.g., 

```js
function buildApiServer(host) {
  return `https://${host}/api`;
}
```

where `host` can be the actual host in one particular environment (e.g., production or stage), but could also be replaced by, e.g., `localhost:9000/foo`. Long story short, it seemed like a sound choice.

*The default certificate is not trusted - what can I do about it?*

Well, you could add the certificate to your trusted roots and therefore get rid of the message. However, if you (understandably) don't want to trust third-party generated certificates you can also generate your own certificate and use that one instead. Finally, you could either switch off HTTPS (disable SSL), or use a special browser instance with SSL checking disabled (for Chrome starting with the command line flag `--ignore-certificate-errors` does the trick; don't use this for browsing the public web).

*How can I use kras with webpack?*

There are several ways on how to use kras with webpack. The two most common ways are [documented in detail here](docs/webpack.md). In general, the idea is to run kras side by side to the webpack dev server. This can be archieved by modifying the used *webpack.config.js* or by concurrently running two processes. Of course, programmatically, it can be also achieved to run the webpack dev server and kras on the same port, however, the gain is potentially not worth the effort (at least for most users).

## License

kras is released using the MIT license. For more information see the [LICENSE file](LICENSE).
