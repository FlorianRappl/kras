import { Request, Response } from 'express';
import { KrasServer } from '../types';

export function broadcastAt(server: KrasServer) {
  return (req: Request, res: Response) => {
    server.broadcast(req.body);
    res.sendStatus(200);
  };
}
