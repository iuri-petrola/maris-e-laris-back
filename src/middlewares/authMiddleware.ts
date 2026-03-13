import { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../services/authService';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao informado' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    verifyAdminToken(token);
    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Token invalido' });
  }
}
