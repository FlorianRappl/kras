import { Request, Response } from 'express';
import { KrasServer, KrasConfiguration } from '../types';

function tryRead<T>(fn: () => T) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}

export function readSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    res.json({
      ws: server.ws,
      middlewares: server.middlewares.map((middleware) =>
        tryRead(() => ({
          options: middleware.options,
          source: middleware.source,
        })),
      ),
      injectors: server.injectors
        .map((injector) =>
          tryRead(() => ({
            active: injector.active,
            name: injector.name,
          })),
        )
        .filter((injector) => injector !== undefined),
    });
  };
}

export function downloadSettings(server: KrasServer, config: KrasConfiguration) {
  return (req: Request, res: Response) => {
    res.setHeader('Content-disposition', 'attachment; filename=.krasrc');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(config, undefined, 2));
  };
}

export function saveSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const settings = JSON.parse(req.body || '{}');

    if (typeof settings.ws === 'boolean') {
      server.ws = settings.ws;
    }

    if (settings.injectors) {
      for (const injector of server.injectors) {
        for (const changedInjector of settings.injectors) {
          if (changedInjector.name === injector.name) {
            injector.active = changedInjector.active || false;
            break;
          }
        }
      }
    }
  };
}
