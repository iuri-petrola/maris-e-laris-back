import { Request, Response } from 'express';
import { loginAdmin } from '../services/authService';

export function adminLogin(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'Campos obrigatorios: username, password' });
  }

  try {
    const result = loginAdmin({ username: username.trim(), password });

    if (!result) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar login';
    return res.status(500).json({ error: message });
  }
}
