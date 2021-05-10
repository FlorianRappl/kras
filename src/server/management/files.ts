import { Request, Response } from 'express';
import { readFile as getContent, writeFile as setContent } from 'fs';
import { extname } from 'path';
import { KrasServer } from '../types';

export function readFile(server: KrasServer) {
  return (req: Request, res: Response) => {
    const { name } = req.params;
    const file = Buffer.from(name, 'base64').toString();

    getContent(file, 'utf8', (err, content) => {
      if (err) {
        server.emit('error', err);
      }

      res.json({
        file,
        content,
        type: extname(file),
      });
    });
  };
}

export function saveFile(server: KrasServer) {
  return (req: Request, res: Response) => {
    const { name } = req.params;
    const file = Buffer.from(name, 'base64').toString();
    const content = req.body;

    setContent(file, content, (err) => {
      if (err) {
        server.emit('error', err);
      }

      res.sendStatus(200);
    });
  };
}
