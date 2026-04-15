import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { createClientUser, getClientUserByEmail, getClientUserByNome } from '../services/clientUserService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerClientUser(req: Request, res: Response) {
  const { nome, email, whatsapp, senha } = req.body as {
    nome?: string;
    email?: string;
    whatsapp?: string;
    senha?: string;
  };

  const normalizedNome = nome?.trim() || '';
  const normalizedEmail = email?.trim().toLowerCase() || '';
  const normalizedWhatsapp = whatsapp?.trim() || '';

  if (!normalizedNome || !normalizedEmail || !normalizedWhatsapp || !senha) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, email, whatsapp, senha' });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Informe um e-mail valido.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const existingByEmail = await getClientUserByEmail(normalizedEmail);

    if (existingByEmail) {
      return res.status(409).json({ error: 'Ja existe um cadastro com este nome ou e-mail.' });
    }

    const existingByNome = await getClientUserByNome(normalizedNome);

    if (existingByNome) {
      return res.status(409).json({ error: 'Ja existe um cadastro com este nome.' });
    }

    const created = await createClientUser({
      nome: normalizedNome,
      email: normalizedEmail,
      whatsapp: normalizedWhatsapp,
      senha
    });

    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe um cadastro com este nome ou e-mail.' });
    }

    const message = error instanceof Error ? error.message : 'Erro ao cadastrar cliente';
    return res.status(500).json({ error: message });
  }
}
