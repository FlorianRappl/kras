import { Request, Response } from 'express';
import { KrasServer } from '../types';

function tryRead<T>(fn: () => T) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}

export function readInjectorsSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    res.json({
      injectors: server.injectors
        .map(injector => tryRead(() => ({
          name: injector.name,
          active: injector.active,
          options: {
            ...injector.getOptions(),
          },
        })))
        .filter(injector => injector !== undefined),
    });
  };
}

export function saveInjectorSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const name = req.params.name;
    const options = JSON.parse(req.body || '{}');
    const injector = server.injectors.filter(m => m.name === name)[0];

    if (injector) {
      injector.setOptions(options);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  };
}
