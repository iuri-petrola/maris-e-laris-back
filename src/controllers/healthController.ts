import { Request, Response } from 'express';

const port = process.env.PORT ? Number(process.env.PORT) : 8085;

export function health(_req: Request, res: Response) {
  res.json({ status: 'deu certo o Backend esta sendo executado na porta ' + port });
}