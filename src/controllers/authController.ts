import { Request, Response } from 'express';
import { loginAdmin, loginClient, loginClientByContact } from '../services/authService';

export async function adminLogin(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'Campos obrigatorios: username, password' });
  }

  try {
    const result = await loginAdmin({ username: username.trim(), password });

    if (!result) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar login';
    return res.status(500).json({ error: message });
  }
}

export async function clientLogin(req: Request, res: Response) {
  const { nome, contato, password } = req.body as { nome?: string; contato?: string; password?: string };
  const normalizedContato = contato?.trim() || password?.trim() || '';

  if (!nome || !normalizedContato) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, contato' });
  }

  try {
    const result = await loginClient({ nome: nome.trim(), contato: normalizedContato });

    if (!result) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar login';
    return res.status(500).json({ error: message });
  }
}

export async function clientContactLogin(req: Request, res: Response) {
  const { nome, contato } = req.body as { nome?: string; contato?: string };

  if (!nome || !contato) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, contato' });
  }

  try {
    const result = await loginClientByContact({ nome: nome.trim(), contato: contato.trim() });

    if (!result) {
      return res.status(401).json({ error: 'Dados invalidos' });
    }

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar login';
    return res.status(500).json({ error: message });
  }
}
