import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export type ClientUserInput = {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
};

export type ClientUserItem = {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  ativo: boolean;
  createdAt: string;
};

function mapClientUser(row: {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  ativo: boolean;
  createdAt: Date;
}): ClientUserItem {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    whatsapp: row.whatsapp,
    ativo: row.ativo,
    createdAt: row.createdAt.toISOString()
  };
}

export async function createClientUser(input: ClientUserInput): Promise<ClientUserItem> {
  const passwordHash = await bcrypt.hash(input.senha, 10);

  const created = await prisma.clientUser.create({
    data: {
      nome: input.nome,
      email: input.email.toLowerCase(),
      whatsapp: input.whatsapp,
      passwordHash
    }
  });

  return mapClientUser(created);
}

export async function getClientUserByEmail(email: string): Promise<ClientUserItem | null> {
  const row = await prisma.clientUser.findUnique({
    where: { email: email.toLowerCase() }
  });

  return row ? mapClientUser(row) : null;
}


export async function getClientUserByNome(nome: string): Promise<ClientUserItem | null> {
  const row = await prisma.clientUser.findUnique({
    where: { nome }
  });

  return row ? mapClientUser(row) : null;
}
