import { Request, Response } from 'express';
import { KrasServer } from '../types';

export function readSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    res.json({
      injectors: server.injectors.map(injector => ({
        active: injector.active,
        name: injector.name,
      })),
    });
  };
}

export function saveSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const settings = JSON.parse(req.body || '{}');

    for (const injector of server.injectors) {
      for (const changedInjector of settings.injectors) {
        if (changedInjector.name === injector.name) {
          injector.active = changedInjector.active;
          break;
        }
      }
    }
  };
}
