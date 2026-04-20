import { Request, Response } from 'express';
import { issueClientToken } from '../services/authService';
import { createPedido, getPedidosByClientNome, markPedidoAsEnviadoByClient, removePedidoItemByClient } from '../services/pedidoService';

export async function createPublicPedido(req: Request, res: Response) {
  const { nome, contato, produtoId } = req.body as {
    nome?: string;
    contato?: string;
    produtoId?: number;
    numero?: string;
  };

  const normalizedNome = nome?.trim() || '';
  const normalizedContato = contato?.trim() || '';
  const normalizedProdutoId = Number(produtoId);
  const normalizedNumero = typeof req.body?.numero === 'string' ? req.body.numero.trim() : '';

  if (!normalizedNome || !normalizedContato || !Number.isInteger(normalizedProdutoId) || normalizedProdutoId < 1) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, contato, produtoId' });
  }

  try {
    const pedido = await createPedido({
      nome: normalizedNome,
      contato: normalizedContato,
      produtoId: normalizedProdutoId,
      numero: normalizedNumero || undefined
    });

    return res.status(201).json({
      ...pedido,
      client: {
        nome: normalizedNome,
        contato: normalizedContato,
        token: issueClientToken(normalizedNome, { persistent: true }).token
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar pedido';
    const status = message === 'Produto nao encontrado' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}

function normalizeImagemUrl(req: Request, imageUrl: string): string {
  const host = `${req.protocol}://${req.get('host')}`;
  return imageUrl.startsWith('/') ? `${host}${imageUrl}` : imageUrl;
}

export async function listClientPedidos(req: Request, res: Response) {
  try {
    const nome = (req as Request & { clientNome?: string }).clientNome;

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const pedidos = await getPedidosByClientNome(nome);

    if (!pedidos) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }

    return res.json(
      pedidos.map((pedido) => ({
        ...pedido,
        produto: {
          ...pedido.produto,
          imagemUrl: normalizeImagemUrl(req, pedido.produto.imagemUrl)
        }
      }))
    );
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao listar pedidos do cliente' });
  }
}


export async function markClientPedidoAsEnviado(req: Request, res: Response) {
  try {
    const nome = (req as Request & { clientNome?: string }).clientNome;
    const numero = req.params.numero?.trim() || '';

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    if (!numero) {
      return res.status(400).json({ error: 'Numero do pedido obrigatorio' });
    }

    await markPedidoAsEnviadoByClient(nome, numero);
    return res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao enviar pedido';
    const status = message === 'Cliente nao encontrado' ? 404 : message === 'Pedido nao encontrado' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}

export async function removeClientPedidoItem(req: Request, res: Response) {
  try {
    const nome = (req as Request & { clientNome?: string }).clientNome;
    const numero = req.params.numero?.trim() || '';
    const produtoId = Number(req.params.produtoId);

    if (!nome) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    if (!numero || !Number.isInteger(produtoId) || produtoId < 1) {
      return res.status(400).json({ error: 'Numero do pedido e produto obrigatorios' });
    }

    await removePedidoItemByClient(nome, numero, produtoId);
    return res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao remover item do pedido';
    const status = message === 'Cliente nao encontrado' || message === 'Item do pedido nao encontrado' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}
