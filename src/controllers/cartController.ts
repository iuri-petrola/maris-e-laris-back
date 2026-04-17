import { Request, Response } from 'express';
import { addCartItem, getCartSummary, removeCartItem, updateCartItem } from '../services/cartService';

function getClientNome(req: Request): string | null {
  return (req as Request & { clientNome?: string }).clientNome || null;
}

function normalizeImagemUrl(req: Request, imageUrl: string): string {
  const host = `${req.protocol}://${req.get('host')}`;
  return imageUrl.startsWith('/') ? `${host}${imageUrl}` : imageUrl;
}

function normalizeCart(req: Request, cart: { items: Array<{ produto: { imagemUrl: string } }> ; total: number }) {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      produto: {
        ...item.produto,
        imagemUrl: normalizeImagemUrl(req, item.produto.imagemUrl)
      }
    }))
  };
}

export async function getClientCart(req: Request, res: Response) {
  try {
    const nome = getClientNome(req);

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const cart = await getCartSummary(nome);

    if (!cart) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }

    return res.json(normalizeCart(req, cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar carrinho';
    return res.status(500).json({ error: message });
  }
}

export async function createClientCartItem(req: Request, res: Response) {
  const { produtoId, quantidade } = req.body as { produtoId?: number; quantidade?: number };

  if (!produtoId) {
    return res.status(400).json({ error: 'Campo obrigatorio: produtoId' });
  }

  const normalizedQuantidade = Number(quantidade || 1);

  if (!Number.isInteger(normalizedQuantidade) || normalizedQuantidade < 1) {
    return res.status(400).json({ error: 'A quantidade deve ser um numero inteiro maior que zero.' });
  }

  try {
    const nome = getClientNome(req);

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const cart = await addCartItem(nome, Number(produtoId), normalizedQuantidade);

    if (!cart) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }

    return res.status(201).json(normalizeCart(req, cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao adicionar item ao carrinho';
    const status = message === 'Produto nao encontrado' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}

export async function updateClientCartItem(req: Request, res: Response) {
  const itemId = Number(req.params['id']);
  const { quantidade } = req.body as { quantidade?: number };

  if (!Number.isInteger(itemId) || itemId < 1) {
    return res.status(400).json({ error: 'Item do carrinho invalido.' });
  }

  const normalizedQuantidade = Number(quantidade);

  if (!Number.isInteger(normalizedQuantidade) || normalizedQuantidade < 1) {
    return res.status(400).json({ error: 'A quantidade deve ser um numero inteiro maior que zero.' });
  }

  try {
    const nome = getClientNome(req);

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const cart = await updateCartItem(nome, itemId, normalizedQuantidade);

    if (!cart) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }

    return res.json(normalizeCart(req, cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar item do carrinho';
    const status = message === 'Item do carrinho nao encontrado' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}

export async function deleteClientCartItem(req: Request, res: Response) {
  const itemId = Number(req.params['id']);

  if (!Number.isInteger(itemId) || itemId < 1) {
    return res.status(400).json({ error: 'Item do carrinho invalido.' });
  }

  try {
    const nome = getClientNome(req);

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const cart = await removeCartItem(nome, itemId);

    if (!cart) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }

    return res.json(normalizeCart(req, cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao remover item do carrinho';
    const status = message == 'Item do carrinho nao encontrado' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}
