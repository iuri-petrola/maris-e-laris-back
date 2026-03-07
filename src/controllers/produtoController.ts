import { Request, Response } from 'express';
import { getProdutos } from '../services/produtoService';

export async function listProdutos(req: Request, res: Response) {
  try {
    const produtos = await getProdutos();
    const host = `${req.protocol}://${req.get('host')}`;
    const normalized = produtos.map((item) => ({
      ...item,
      imagemUrl: item.imagemUrl.startsWith('/') ? `${host}${item.imagemUrl}` : item.imagemUrl
    }));
    res.json(normalized);
  } catch (_error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}
