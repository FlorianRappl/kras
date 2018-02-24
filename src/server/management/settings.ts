import { Request, Response } from 'express';
import { KrasServer } from '../types';

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
      injectors: server.injectors
        .map(injector => tryRead(() => ({
          active: injector.active,
          name: injector.name,
        })))
        .filter(injector => injector !== undefined),
    });
  };
}

export function saveSettings(server: KrasServer) {
  return (req: Request, res: Response) => {
    const settings = JSON.parse(req.body || '{}');
    server.ws = settings.ws || false;

    for (const injector of server.injectors) {
      for (const changedInjector of settings.injectors) {
        if (changedInjector.name === injector.name) {
          injector.active = changedInjector.active || false;
          break;
        }
      }
    }
  };
}
