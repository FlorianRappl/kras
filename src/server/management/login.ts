import { Request, Response, NextFunction } from 'express';
import { KrasServer, KrasConfiguration, KrasServerHandler } from '../types';
import * as providers from '../auth';

const bearer = 'Bearer ';

export function getAuth(server: KrasServer, config: KrasConfiguration): KrasServerHandler {
  const auth = config.auth;
  const provider = auth && providers[auth.provider];

  if (provider) {
    return (req: Request, res: Response, next: NextFunction) => {
      const header = req.header('authorization');

      if (header && header.startsWith(bearer)) {
        const token = header.substr(bearer.length);
        const valid = provider.validateToken(auth, token);

        if (valid) {
          return next();
        }
      }

      return res.sendStatus(401);
    }
  }

  return (_req: Request, _res: Response, next: NextFunction) => next();
}

export function userLogin(server: KrasServer, config: KrasConfiguration): KrasServerHandler {
  const auth = config.auth;
  const provider = auth && providers[auth.provider];

  return (req: Request, res: Response) => {
    const credentials = JSON.parse(req.body || '{}');
    const token = provider && provider.generateToken(auth, credentials);

    if (token) {
      res.json({ token });
    } else {
      res.sendStatus(403);
    }
  }
}
