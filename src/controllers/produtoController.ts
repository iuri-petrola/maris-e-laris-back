import { Request, Response } from 'express';
import { getProdutos } from '../services/produtoService';

export async function listProdutos(_req: Request, res: Response) {
  try {
    const produtos = await getProdutos();
    res.json(produtos);
  } catch (_error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}
