import { prisma } from '../lib/prisma';

export type ProdutoItem = {
  id: number;
  nome: string;
  imagemUrl: string;
  videoUrl: string | null;
  ativo: boolean;
};

type ProdutoInput = {
  nome: string;
  imagemUrl: string;
  videoUrl?: string | null;
};

export async function getProdutos(includeInactive = false): Promise<ProdutoItem[]> {
  const rows = await prisma.produto.findMany({
    where: includeInactive ? undefined : { ativo: true },
    orderBy: { id: 'desc' }
  });

  return rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    imagemUrl: row.imagemUrl,
    videoUrl: row.videoUrl,
    ativo: row.ativo
  }));
}

export async function createProduto(input: ProdutoInput): Promise<ProdutoItem> {
  const created = await prisma.produto.create({
    data: {
      nome: input.nome,
      imagemUrl: input.imagemUrl,
      videoUrl: input.videoUrl ?? null,
      ativo: true
    }
  });

  return {
    id: created.id,
    nome: created.nome,
    imagemUrl: created.imagemUrl,
    videoUrl: created.videoUrl,
    ativo: created.ativo
  };
}

export async function getProdutoById(id: number): Promise<ProdutoItem | null> {
  const row = await prisma.produto.findUnique({
    where: { id }
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    nome: row.nome,
    imagemUrl: row.imagemUrl,
    videoUrl: row.videoUrl,
    ativo: row.ativo
  };
}

export async function updateProduto(
  id: number,
  input: Partial<ProdutoInput>
): Promise<ProdutoItem | null> {
  const existing = await prisma.produto.findUnique({
    where: { id }
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.produto.update({
    where: { id },
    data: {
      nome: input.nome ?? existing.nome,
      imagemUrl: input.imagemUrl ?? existing.imagemUrl,
      videoUrl: input.videoUrl !== undefined ? input.videoUrl : existing.videoUrl
    }
  });

  return {
    id: updated.id,
    nome: updated.nome,
    imagemUrl: updated.imagemUrl,
    videoUrl: updated.videoUrl,
    ativo: updated.ativo
  };
}

export async function deactivateProduto(id: number, imagemUrl: string): Promise<ProdutoItem | null> {
  const existing = await prisma.produto.findUnique({
    where: { id }
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.produto.update({
    where: { id },
    data: {
      ativo: false,
      imagemUrl
    }
  });

  return {
    id: updated.id,
    nome: updated.nome,
    imagemUrl: updated.imagemUrl,
    videoUrl: updated.videoUrl,
    ativo: updated.ativo
  };
}

export async function reactivateProduto(id: number, imagemUrl: string): Promise<ProdutoItem | null> {
  const existing = await prisma.produto.findUnique({
    where: { id }
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.produto.update({
    where: { id },
    data: {
      ativo: true,
      imagemUrl
    }
  });

  return {
    id: updated.id,
    nome: updated.nome,
    imagemUrl: updated.imagemUrl,
    videoUrl: updated.videoUrl,
    ativo: updated.ativo
  };
}
