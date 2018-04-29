# Management API

The management of kras is primarily web based via an API first approach.

## Available Endpoints

The following endpoints exist for getting or setting information about the current runtime.

```plain
{apiRoot}/config
{apiRoot}/logs
{apiRoot}/broadcast
{apiRoot}/data
{apiRoot}/data/request/:id
{apiRoot}/data/message/:id
{apiRoot}/data/error/:id
{apiRoot}/file/:name
{apiRoot}/settings
{apiRoot}/injector
{apiRoot}/injector/:name
```

By default the `apiRoot` is `/manage`. Hence locally the configuration is accessible via `https://localhost:9000/manage/config` if we use SSL together with the default port 9000.

## Description

A few more details on each of these endpoints.

### GET /config

Gets the current configuration.

Example:

```json
{
  "directory": "/mnt/g/Code/kras/mocks",
  "map": {
    "/": "https://httpbin.org",
    "/api": "https://jsonplaceholder.typicode.com",
    "/events": "ws://demos.kaazing.com/echo"
  },
  "name": "kras v0.5.0",
  "version": "0.5.0",
  "started": "Fri Mar 09 2018 21:48:05 GMT+0100 (STD)",
  "mode": "running"
}
```

### PUT /config

Changes the current configuration. This can be also used to restart or stop the service.

Example:

```json
{
  "mode": "restart"
}
```

### GET /logs

Gets the current error / exception log of the server.

Example:

```json
{
  "entries": []
}
```

### POST /broadcast

Broadcasts the body of the request via websocket. Can be anything, such that no additional encoding or serialization / deserialization will performed.

### GET /data

Gets the current request data split in normal requests, failed requests, and websocket messages.

Example:

```json
{
  "requests": [
    {
      "id": "ba419f81-2b7f-4bf0-9147-9446bc3bf3d0",
      "time": "2018-03-09T20:50:36.223Z",
      "from": "/api",
      "to": "/posts",
      "status": 200,
      "type": "application/json; charset=utf-8",
      "injector": "proxy-injector"
    }
  ],
  "errors": [],
  "messages": []
}
```

### WS /data

This is the live feed to be notified when a new request has been recorded.

### GET /data/request/:id

A detailed view of a specific request.

Example:

```json
{
  "id":"ba419f81-2b7f-4bf0-9147-9446bc3bf3d0",
  "start":"2018-03-09T20:50:36.223Z",
  "end":"2018-03-09T20:50:36.468Z",
  "request": {
    "url":"/posts",
    "target":"/api",
    "query": {

    },
    "method":"GET",
    "headers": {
      "host":"localhost:9000",
      "connection":"keep-alive",
      "upgrade-insecure-requests":"1",
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.119 Safari/537.36 OPR/51.0.2830.23 (Edition beta)",
      "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "accept-encoding":"gzip, deflate, br",
      "accept-language":"en-US,en;q=0.9"
    },
    "content":""
   },
   "response": {
    "status": {
      "code": 200,
      "text":"OK"
    },
    "url":"https://jsonplaceholder.typicode.com/posts",
    "content": {
      "type":"Buffer",
      "data": [
        //...
      ],
      "headers": {
        "date":"Fri, 09 Mar 2018 20:50:36 GMT",
        "content-type":"application/json; charset=utf-8",
        "transfer-encoding":"chunked",
        "connection":"close",
        "set-cookie":"__cfduid=dd788e8744101abe6beea80e2896264241520628636; expires=Sat, 09-Mar-19 20:50:36 GMT; path=/; domain=.typicode.com; HttpOnly",
        "x-powered-by":"Express",
        "vary":"Origin, Accept-Encoding",
        "access-control-allow-credentials":"true",
        "cache-control":"public, max-age=14400",
        "pragma":"no-cache",
        "expires":"Sat, 10 Mar 2018 00:50:36 GMT",
        "x-content-type-options":"nosniff",
        "etag":"W/\"6b80-Ybsq/K6GwwqrYkAsFxqDXGC7DoM\"",
        "via":"1.1 vegur",
        "cf-cache-status":"HIT",
        "expect-ct":"max-age=604800, report-uri=\"https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct\"",
        "server":"cloudflare",
        "cf-ray":"3f906a31a8bb6c94-SJC"
      },
      "injector": {
        "name":"proxy-injector",
        "host": {
          "name":"https://jsonplaceholder.typicode.com"
        }
      }
    }
  }
}
```

### GET /data/message/:id

A detailed view on the specific websocket message.

### GET /data/error/:id

A detailed view on the specific failed request.

### GET /file/:name

Gets the file with the given name from the FS. To allow arbitrary paths for the file the name has to be base64 encoded first.

Example:

```json
{
  "file": "script.js",
  "content": "console.log(\"Hello\");",
  "type": ".js"
}
```

### PUT /file/:name

Saves the file with the given name to the FS. The name must be a base64 string. The body of the request is considered as the file content, i.e., it will literally be streamed to the file.

### GET /settings

Gets the main settings of the current instance.

Example:

```json
{
  "ws": true,
  "injectors": [
    {
      "active": true,
      "name": "script-injector"
    },
    {
      "active": true,
      "name": "har-injector"
    },
    {
      "active": true,
      "name": "json-injector"
    },
    {
      "active": true,
      "name": "proxy-injector"
    },
    {
      "active": false,
      "name": "store-injector"
    }
  ]
}
```

### PUT /settings

Changes the main settings of the current instance.

### GET /injector

Gets all loaded injectors including their current configuration.

Example:

```json
{
  "injectors": [
    {
      "name": "script-injector",
      "active": true,
      "options": {
        "directories": {
          "description": "Select the directories to inspect for matching files.",
          "title": "Source Directories",
          "type": "directory",
          "value": [
            "/mnt/g/Code/kras/mocks"
          ]
        },
        "files": {
          "description": "Toggle or modify the found files without using an external text editor.",
          "title": "Found Files",
          "type": "file",
          "value": []
        },
        "extended": {
          "description": "The options available to all script files via the context argument.",
          "title": "Extended Configuration",
          "type": "json",
          "value": "{}"
        }
      }
    },
    {
      "name": "proxy-injector",
      "active": true,
      "options": {
        "/": {
          "description": "Determines where to proxy to if local URL starts with /.",
          "title": "Target: /",
          "type": "text",
          "value": "https://httpbin.org"
        },
        "/api": {
          "description": "Determines where to proxy to if local URL starts with /api.",
          "title": "Target: /api",
          "type": "text",
          "value": "https://jsonplaceholder.typicode.com"
        },
        "/events": {
          "description": "Determines where to proxy to if local URL starts with /events.",
          "title": "Target: /events",
          "type": "text",
          "value": "ws://demos.kaazing.com/echo"
        }
      }
    }
  ]
}
```

### GET /injector/:name

Gets the specific injector (if loaded) with its current configuration.

### PUT /injector/:name

Changes the given injector. The values need to be send in without their descriptions.
