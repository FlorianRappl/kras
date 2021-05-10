import { Request, Response } from 'express';
import { KrasServer, KrasInjector } from '../types';

function tryRead<T>(fn: () => T) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}

function transformInjector(injector: KrasInjector) {
  return tryRead(() => ({
    name: injector.name,
    active: injector.active,
    options: {
      ...injector.getOptions(),
    },
  }));
}

export function readInjectorsSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const injectors = server.injectors.map(transformInjector).filter((injector) => injector !== undefined);

    res.json({ injectors });
  };
}

export function readInjectorSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const name = req.params.name;
    const injector = server.injectors.filter((m) => m.name === name).map(transformInjector)[0];

    if (injector) {
      res.json(injector);
    } else {
      res.sendStatus(404);
    }
  };
}

export function saveInjectorSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const name = req.params.name;
    const options = JSON.parse(req.body || '{}');
    const injector = server.injectors.filter((m) => m.name === name)[0];

    if (injector) {
      injector.setOptions(options);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  };
}
