import { prisma } from '../lib/prisma';

export type ProdutoItem = {
  id: number;
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
