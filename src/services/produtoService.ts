import { prisma } from '../lib/prisma';

export type ProdutoItem = {
  id: number;
  nome: string;
  imagemUrl: string;
};

type ProdutoInput = {
  nome: string;
  imagemUrl: string;
};

export async function getProdutos(): Promise<ProdutoItem[]> {
  const rows = await prisma.produto.findMany({
    orderBy: { id: 'desc' }
  });

  return rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    imagemUrl: row.imagemUrl
  }));
}

export async function createProduto(input: ProdutoInput): Promise<ProdutoItem> {
  const created = await prisma.produto.create({
    data: {
      nome: input.nome,
      imagemUrl: input.imagemUrl
    }
  });

  return {
    id: created.id,
    nome: created.nome,
    imagemUrl: created.imagemUrl
  };
}
