import { Request, Response } from 'express';
import { getProdutos } from '../services/produtoService';

export function listProdutos(_req: Request, res: Response) {
  const produtos = getProdutos();
  res.json(produtos);
}
