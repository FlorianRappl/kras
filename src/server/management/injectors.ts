import { Request, Response } from 'express';
import { KrasServer } from '../types';

export function readInjectorsSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    res.json({
      injectors: server.injectors.map(injector => ({
        name: injector.name,
        active: injector.active,
        options: {
          ...injector.getOptions(),
        },
      })),
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
      return res.sendStatus(200);
    }

    res.sendStatus(404);
  };
}
