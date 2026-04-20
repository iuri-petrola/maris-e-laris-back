import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import {
  getClientUserByNome,
  getClientUserProfileByNome,
  ensureClientUser
} from '../services/clientUserService';
import { issueClientToken } from '../services/authService';

export async function registerClientUser(req: Request, res: Response) {
  const { nome, contato } = req.body as {
    nome?: string;
    contato?: string;
  };

  const normalizedNome = nome?.trim() || '';
  const normalizedContato = contato?.trim() || '';

  if (!normalizedNome || !normalizedContato) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, contato' });
  }

  try {
    const existingByNome = await getClientUserByNome(normalizedNome);
    const created = await ensureClientUser(normalizedNome, normalizedContato);

    return res.status(201).json({
      ...created,
      alreadyExisted: !!existingByNome,
      ...issueClientToken(created.nome)
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe um cadastro com este nome.' });
    }

    const message = error instanceof Error ? error.message : 'Erro ao cadastrar cliente';
    return res.status(500).json({ error: message });
  }
}

export async function getClientMe(req: Request, res: Response) {
  try {
    const nome = (req as Request & { clientNome?: string }).clientNome;

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const clientUser = await getClientUserProfileByNome(nome);

    if (!clientUser || !clientUser.ativo) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }

    return res.json(clientUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar area do cliente';
    return res.status(500).json({ error: message });
  }
}
