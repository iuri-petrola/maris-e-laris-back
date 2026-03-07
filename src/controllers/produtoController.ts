import { Request, Response } from 'express';
import { createProduto, getProdutos } from '../services/produtoService';

function normalizeImagemUrl(req: Request, imageUrl: string): string {
  const host = `${req.protocol}://${req.get('host')}`;
  return imageUrl.startsWith('/') ? `${host}${imageUrl}` : imageUrl;
}

export async function listProdutos(req: Request, res: Response) {
  try {
    const produtos = await getProdutos();
    const normalized = produtos.map((item) => ({
      ...item,
      imagemUrl: normalizeImagemUrl(req, item.imagemUrl)
    }));
    res.json(normalized);
  } catch (_error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}

export async function createProdutoItem(req: Request, res: Response) {
  const { nome } = req.body as { nome?: string };
  const file = (req as Request & { file?: { filename: string } }).file;

  if (!nome || !file) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, image(file)' });
  }

  try {
    const filesPublicPath = process.env.FILES_PUBLIC_PATH || '/files';
    const imagemUrl = `${filesPublicPath}/produtos/${file.filename}`;
    const created = await createProduto({ nome: nome.trim(), imagemUrl });
    return res.status(201).json({
      ...created,
      imagemUrl: normalizeImagemUrl(req, created.imagemUrl)
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
}
