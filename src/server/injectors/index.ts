import FormData from 'form-data';
import { existsSync } from 'fs';
import { resolve, basename } from 'path';
import { parse } from 'url';
import type { EventEmitter } from 'events';
import type { Request, Response } from 'express';
import { fromMissing, isEncrypted, getPort, deepMerge, getLast } from '../helpers';
import { injectorDebug, injectorConfig, injectorMain } from '../info';
import type {
  KrasConfiguration,
  KrasServer,
  KrasAnswer,
  KrasInjector,
  KrasInjectorConfig,
  KrasRequest,
} from '../types';

import HarInjector from './har-injector';
import JsonInjector from './json-injector';
import ProxyInjector from './proxy-injector';
import ScriptInjector from './script-injector';
import StoreInjector from './store-injector';

const specialHeaders = ['origin', 'content-type'];

const coreInjectors: Record<string, any> = {
  har: HarInjector,
  json: JsonInjector,
  proxy: ProxyInjector,
  script: ScriptInjector,
  store: StoreInjector,
};

function sendResponse(req: KrasRequest, ans: KrasAnswer, res: Response) {
  if (!ans.redirectUrl) {
    const origin = req.headers.origin;
    const type = getLast(ans.headers['content-type']);

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

function normalizeTarget(head: string) {
  return head.endsWith('/') ? head.substring(0, head.length - 1) : head;
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

  return undefined;
}

function normalizeRequest(targets: Array<string>, req: Request): KrasRequest {
  const target = getTarget(targets, req.originalUrl) || '';
  const url = req.originalUrl.substring(target.length);
  const headers: Record<string, string | Array<string>> = deepMerge({ ...req.headers }, req.addedHeaders);
  const query: Record<string, string | Array<string>> = deepMerge({ ...req.query }, req.addedQuery);
  const method = typeof req.method === 'string' ? req.method : 'GET';

  let content: string | FormData;
  let formData: FormData;
  let rawContent: Buffer;

  if (req.headers['content-type'] && req.headers['content-type'].search('multipart/form-data') !== -1) {
    formData = new FormData();
    typeof req.body === 'object' &&
      Object.keys(req.body).map((field: any) => {
        return formData.append(field, req.body[field]);
      });
    req.files &&
      req.files.length &&
      Array.prototype.map.call(req.files, (file: any) => {
        return formData.append(file.fieldname, file.buffer, {
          filename: file.originalname,
        });
      });
    headers['content-type'] = formData.getHeaders()['content-type'];
    content = formData;
    rawContent = formData.getBuffer();
  } else if (typeof req.body === 'string') {
    content = req.body;
    rawContent = Buffer.from(content);
  } else {
    content = '';

    try {
      rawContent = Buffer.from(req.body);
    } catch {
      rawContent = Buffer.from('');
    }
  }

  for (const name of req.removedHeaders) {
    delete headers[name];
  }

  for (const name of req.removedQuery) {
    delete query[name];
  }

  return {
    url,
    encrypted: isEncrypted(req),
    port: getPort(req),
    remoteAddress: req.connection.remoteAddress || req.socket.remoteAddress,
    target,
    query,
    method,
    headers,
    content,
    rawContent,
    formData,
  };
}

async function tryInjectors(injectors: Array<KrasInjector>, req: KrasRequest): Promise<KrasAnswer | void> {
  if (injectors.length > 0) {
    const injector = injectors.shift();
    const { ignore, handle } = injector.config || { ignore: undefined, handle: undefined };
    const ignored = ignore && ignore.some((t) => normalizeTarget(t) === req.target);
    const handled = !handle || handle.some((t) => normalizeTarget(t) === req.target);
    const response = !ignored && handled && (await injector.handle(req));
    return response || tryInjectors(injectors, req);
  }

  return undefined;
}

function handleRequest(server: KrasServer, req: KrasRequest, res: Response) {
  const injectors = server.injectors.filter((injector) => injector.active);

  server.emit('request', req);

  tryInjectors(injectors, req).then(async (ans) => {
    res.prepared = ans;

    if (!ans) {
      server.emit('missing', req);
      ans = fromMissing(req.url);
    } else {
      server.emit('response', ans);
    }

    for (const middleware of res.middlewares) {
      await middleware();
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

function findInjectorIn(injectorDir: Array<string> | string, name: string) {
  const paths = Array.isArray(injectorDir) ? injectorDir : typeof injectorDir === 'string' ? [injectorDir] : [];

  for (const path of paths) {
    const target = resolve(path, name);
    const Injector = findInjector(target);

    if (Injector) {
      return Injector;
    }
  }

  return undefined;
}

async function addInjectorInstance(
  Injector: KrasInjectorClass,
  options: KrasInjectorConfig,
  config: KrasConfiguration,
  server: KrasServer,
) {
  if (Injector) {
    const instance = new Injector(options, config, server);

    if (typeof instance.setup === 'function') {
      await instance.setup();
    }

    if (typeof instance.handle === 'function') {
      server.injectors.push(instance);
    }
  }
}

export async function withInjectors(server: KrasServer, config: KrasConfiguration) {
  const names = Object.keys(config.injectors);
  const heads = Object.keys(config.map)
    .map((head) => normalizeTarget(head))
    .sort((a, b) => b.length - a.length);
  const ignored = Object.keys(config.map)
    .filter((head) => config.map[head] === false)
    .map((head) => normalizeTarget(head));
  const always = heads.length === 0;

  if (injectorDebug) {
    const Injector = findInjector(injectorMain);
    await addInjectorInstance(Injector, injectorConfig, config, server);
  }

  for (const name of names) {
    const isPath = basename(name) !== name && existsSync(name);
    const options = config.injectors[name];
    const Injector =
      coreInjectors[name] ||
      (isPath && findInjector(name)) ||
      findInjectorIn(config.injectorDirs, `${name}-injector`) ||
      findInjectorIn(options.baseDir, `${name}-injector`) ||
      findInjector(`kras-${name}-injector`) ||
      findInjector(`${name}-kras-injector`) ||
      findInjector(`${name}-injector`);
    await addInjectorInstance(Injector, options, config, server);
  }

  server.add({
    rate: (req) => {
      if (!always) {
        const target = getTarget(heads, req.url);
        const hasTarget = target !== undefined;
        return hasTarget && !ignored.includes(target) ? 1 : 0;
      }

      return 1;
    },
    handle: (req, res) => {
      const entry = normalizeRequest(heads, req);
      return handleRequest(server, entry, res);
    },
  });
}

export { ScriptInjector, ProxyInjector, HarInjector, StoreInjector, JsonInjector };
