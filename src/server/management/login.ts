import * as providers from '../auth';
import { Request, Response } from 'express';
import { parse } from 'url';
import { KrasServer, KrasConfiguration, KrasServerHandler, KrasServerMethods } from '../types';

const bearer = 'Bearer ';

export interface ProtectHandler {
  (api: KrasServerMethods): KrasServerMethods;
}

export function getAuth(server: KrasServer, config: KrasConfiguration): ProtectHandler {
  const auth = config.auth;
  const provider = auth && providers[auth.provider];

  if (provider) {
    return (server) => {
      const connectToFeed = server.feed;
      server.feed = (handler) => {
        connectToFeed((ws, req) => {
          const { token } = parse(req.url, true).query;

          if (!Array.isArray(token)) {
            const valid = provider.validateToken(auth, token);

            if (valid) {
              return handler(ws, req);
            }
          }

          ws.close();
        });
        return server;
      };
      return server.any((req, res, next) => {
        const header = req.header('authorization');

        if (header && header.startsWith(bearer)) {
          const token = header.substring(bearer.length);
          const valid = provider.validateToken(auth, token);

          if (valid) {
            return next();
          }
        }

        return res.sendStatus(401);
      });
    };
  }

  return (server) => server;
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
  };
}
