import { resolve } from 'path';
import { fromMissing } from '../helpers/build-response';
import { open } from '../helpers/json-store';
import { Request, Response } from 'express';
import { parse } from 'url';
import { KrasConfiguration, KrasServer, KrasAnswer, KrasRequestHandler, KrasInjectorInfo, KrasInjector, KrasResponse, KrasInjectorConfig, KrasRequest } from '../types';
import { EventEmitter } from 'events';

const specialHeaders = [
  'origin',
  'content-type',
];

function sendResponse(req: KrasRequest, ans: KrasAnswer, res: Response) {
  if (!ans.redirectUrl) {
    const origin = req.headers['origin'];
    const type = ans.headers['content-type'];

    for (const headerName of Object.keys(ans.headers)) {
      if (specialHeaders.indexOf(headerName) === -1) {
        res.setHeader(headerName, ans.headers[headerName]);
      }
    }

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(ans.status.code);
    res.type(type);
    res.end(ans.content);
  } else {
    const target = parse(ans.redirectUrl);
    res.redirect(ans.status.code, target.path);
  }
}

function getTarget(targets: Array<string>, url: string) {
  for (const target of targets) {
    if (url.startsWith(target)) {
      const c = url[target.length];

      if (c === undefined || c === '?' || c === '/') {
        return target;
      }
    }
  }

  if (targets.indexOf('/') !== -1) {
    return '';
  }

  return undefined;
}

function normalize(targets: Array<string>, req: Request): KrasRequest {
  const target = getTarget(targets, req.originalUrl);
  const url = req.originalUrl.substr(target.length);
  const query = Object.assign({}, req.query);
  const headers = Object.assign({}, req.headers);
  const content = typeof req.body === 'string' ? req.body : '';
  const method = typeof req.method === 'string' ? req.method : 'GET';
  delete query['_'];

  return {
    url,
    target: target || '/',
    query,
    method,
    headers,
    content,
  };
}

function tryInjectors(injectors: Array<KrasInjector>, req: KrasRequest): Promise<KrasAnswer | void> {
  if (injectors.length > 0) {
    const injector = injectors.shift();
    const response = injector.handle(req);

    return Promise.resolve<KrasResponse>(response)
      .then((ans) => ans || tryInjectors(injectors, req));
  }

  return Promise.resolve(undefined);
}

function handleRequest(server: KrasServer, req: KrasRequest, res: Response) {
  const injectors = server.injectors
    .filter((injector) => injector.active);

  server.emit('request', req);

  tryInjectors(injectors, req)
    .then((ans) => {
      if (!ans) {
        server.emit('missing', req);
        ans = fromMissing(req.url);
      } else {
        server.emit('response', ans);
      }

      sendResponse(req, ans, res);
    });
}

interface KrasInjectorClass {
  new (options: KrasInjectorConfig, config: KrasConfiguration, core: EventEmitter): KrasInjector;
}

function findInjector(modulePath: string): KrasInjectorClass {
  try {
    const { default: Injector } = require(modulePath);
    return Injector;
  } catch (e) {
    return undefined;
  }
}

export function withInjectors(server: KrasServer, config: KrasConfiguration) {
  const names = Object.keys(config.injectors);
  const heads = Object.keys(config.map).sort((a, b) => b.length - a.length);

  for (const name of names) {
    const options = config.injectors[name];
    const Injector = findInjector(`${name}-injector`) || findInjector(`./${name}-injector`);

    if (Injector) {
      server.injectors.push(new Injector(options, config, server));
    }
  }

  server.add({
    rate: (req) => {
      const hasTarget = getTarget(heads, req.url) !== undefined;
      return hasTarget ? 1 : 0;
    },
    handle: (req, res) => {
      const entry = normalize(heads, req);
      return handleRequest(server, entry, res);
    },
  });
};
