import { NextFunction, Request, Response } from 'express';
import { verifyAdminToken, verifyClientToken } from '../services/authService';

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


export function requireClientAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao informado' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = verifyClientToken(token);

    if (payload.role !== 'client' || !payload.sub) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    (req as Request & { clientNome?: string }).clientNome = payload.sub;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Token invalido' });
  }
}
