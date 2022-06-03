# Middleware

kras also allows you to specify some middleware that will be used for each request. In general a middleware is like an injector, but in contrast to an injector an arbitrary number of middlewares can be applied (not just a single one).

Middlewares are defined in the *.krasrc* with the `middlewares` option:

```json
{
  "middlewares": [
    {
      "source": "./my-middleware",
      "options": ["anything", 5]
    }
  ]
}
```

The options will be used as input for the defined middleware. As seen, the middleware can actually lead to a local module, but it could also be transported in a package:

```json
{
  "middlewares": [
    {
      "source": "some-middleware-package",
      "options": []
    }
  ]
}
```

The middleware module itself has either to export a function that is used as a middleware handler or contain a `setup` function.

Let's see a middleware handler:

```js
module.exports = function middlewareCreator(option1, option2) {
  // creator for the handler
  
  return (req, res, next) => {
    //handler
  };
};
```

Let's see a setup middleware:

```js
exports.setup = function setup(server, config) {
  // setup function
};
```

Both work together, too. They are not exclusive.

A handler that is run in the middleware follows the Node.js / Express handler convention, i.e., receiving three arguments:

1. Request object
2. Response object
3. Callback for next middleware

This way, the middleware in kras really allows you to use the full spectrum, e.g., to add something to the request:

```js
module.exports = function (cookieName) {  
  return (req, res, next) => {
    res.headers['set-cookie'] = `${cookieName}=42`;
    next();
  };
};
```
