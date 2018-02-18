# Usage with Webpack

One of the use cases of kras is mocking the API server(s) during development. As most frontend development happens these days with webpack as build basis, it makes sense to look into details on how kras can be seamlessly integrated into a webpack focused workflow.

There are several ways on how the integration may happen or look like:

- Requiring users to install kras globally (but providing a *.krasrc* file already)
- Have kras as a (dev) dependency and
  - have it mentioned in the package.json scripts with either an explicit configuration file or a *.krasrc* file
  - integrate it in the *webpack.config.js*
  - write a script that integrates the webpack dev server into kras

The two most common ways will are described in greater detail below.

## Integration to Project Scripts

With the help of simple utilities, e.g., `concurrently` we can start multiple applications at once.

Let's consider the following *package.json*:

```json
{
  "scripts": {
    "start": "concurrently --kill-others \"kras\" \"npm run serve\"",
    "serve": "..."
  }
}
```

The idea is that the `serve` (or whatever name we choose) command should run just the application, i.e., without kras on the side. However, in the standard path `npm start` should actually do two things, run kras (with any command line options), and our standard application via the formerly mentioned `npm run serve` command.

Potentially, the port of kras needs to be changed, e.g., via the *.krasrc* in the project's root directory, or via the command line option, such as `"kras --port 9123"` instead of simply writing `"kras"`.

`concurrently` is certainly not the only Node package that can help us doing this, however, it may be one of the simplest and common ones. Alternatives are many incl. the very advanced `pm2` package.

## Integration to Webpack Configuration

For webpack (and many other bundlers, even task runners, e.g., Gulp) we can abuse the fact that kras was released not only as a CLI tool, but also as a library. So at the end of the day we may simply use the package within our application / run scripts to spawn / block the port we want it to.

While it can make sense to run kras always, we usually want to run kras only during (live) development, i.e., when the webpack dev server is online. There are multiple ways to archieve this:

- Use a dedicated configuration file for the dev server
- Branch in the main configuration file

We illustrate the concept in the latter (with the former it is even simpler to implement):

```js
// ...
const develop = process.argv.filter(v => v.indexOf('webpack-dev-server') !== -1).length === 1;

if (develop) {
  // Run kras here
}

// Export configuration
```

So we run kras when we detect that we are in development mode.

Let's see an example of how that may look:

```js
// mockserver.js
const { resolve } = require('path');
const { runKras } = require('kras');
const directory = resolve(__dirname, 'mocks');

module.exports = function (port) {
  return runKras({
    port,
    map: {
      // ... your mapping
    },
    directory,
    injectors: {
      'script': {
        active: true,
        extended: {
          // ... options for specific mock scripts
        },
      },
      'har': {
        active: true,
        delay: false,
      },
      'json': {
        active: true,
      },
      'proxy': {
        active: true,
      },
    }
  });
};
```

The *webpack.config.js* therefore has the following modifications:

```js
// ...
const mockServer = require('./mockserver');
const develop = process.argv.filter(v => v.indexOf('webpack-dev-server') !== -1).length === 1;
const port = process.env.PORT || 9000;

if (develop) {
  mockServer(port + 1);
}

// Export configuration
```

The important part is that we select a port that does not conflict with the one chosen by the webpack dev server.

In this configuration the server ends when we (forcefully) close the webpack dev server. Alternatively, we can also stop it explicitly if wanted.
