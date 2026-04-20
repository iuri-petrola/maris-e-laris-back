import { prisma } from '../lib/prisma';

export type ClientUserInput = {
  nome: string;
  contato: string;
};

export type ClientUserItem = {
  id: number;
  nome: string;
  contato: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapClientUser(row: {
  id: number;
  nome: string;
  contato: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ClientUserItem {
  return {
    id: row.id,
    nome: row.nome,
    contato: row.contato,
    ativo: row.ativo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function createClientUser(input: ClientUserInput): Promise<ClientUserItem> {
  const created = await prisma.clientUser.create({
    data: {
      nome: input.nome,
      contato: input.contato
    }
  });

  return mapClientUser(created);
}

export async function getClientUserByNome(nome: string): Promise<ClientUserItem | null> {
  const row = await prisma.clientUser.findUnique({
    where: { nome }
  });

  return row ? mapClientUser(row) : null;
}

export async function getClientUserProfileByNome(nome: string): Promise<ClientUserItem | null> {
  const row = await prisma.clientUser.findUnique({
    where: { nome }
  });

  return row ? mapClientUser(row) : null;
}

export async function ensureClientUser(nome: string, contato: string): Promise<ClientUserItem> {
  const existing = await prisma.clientUser.findUnique({
    where: { nome }
  });

  if (existing) {
    const updated = await prisma.clientUser.update({
      where: { id: existing.id },
      data: {
        contato
      }
    });

    return mapClientUser(updated);
  }

  return createClientUser({
    nome,
    contato
  });
}
