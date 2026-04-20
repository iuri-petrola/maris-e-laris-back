import { Request, Response } from 'express';
import { getAdminPedidos, updateAdminPedidoStatus } from '../services/adminPedidoService';

function normalizeImagemUrl(req: Request, imageUrl: string): string {
  const host = `${req.protocol}://${req.get('host')}`;
  return imageUrl.startsWith('/') ? `${host}${imageUrl}` : imageUrl;
}

export async function listAdminPedidos(req: Request, res: Response) {
  try {
    const pedidos = await getAdminPedidos();
    const normalized = pedidos.map((pedido) => ({
      ...pedido,
      produto: {
        ...pedido.produto,
        imagemUrl: normalizeImagemUrl(req, pedido.produto.imagemUrl)
      }
    }));

    return res.json(normalized);
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}


export async function updatePedidoStatus(req: Request, res: Response) {
  const numero = req.params.numero?.trim() || '';
  const status = (req.body as { status?: string }).status?.trim() || '';

  if (!numero || !status) {
    return res.status(400).json({ error: 'Campos obrigatorios: numero, status' });
  }

  try {
    await updateAdminPedidoStatus({ numero, status });
    return res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar status do pedido';
    const statusCode = message === 'Pedido nao encontrado' ? 404 : message === 'Status invalido' ? 400 : 500;
    return res.status(statusCode).json({ error: message });
  }
}
