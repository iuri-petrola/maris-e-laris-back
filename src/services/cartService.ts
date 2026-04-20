import { prisma } from '../lib/prisma';

export type CartProductItem = {
  id: number;
  nome: string;
  preco: number;
  imagemUrl: string;
  videoUrl: string | null;
};

export type CartItem = {
  id: number;
  quantidade: number;
  subtotal: number;
  produto: CartProductItem;
};

export type CartSummary = {
  items: CartItem[];
  total: number;
};

function mapCartRow(row: {
  id: number;
  quantidade: number;
  produto: {
    id: number;
    nome: string;
    preco: unknown;
    imagemUrl: string;
    videoUrl: string | null;
  };
}): CartItem {
  const preco = Number(row.produto.preco);

  return {
    id: row.id,
    quantidade: row.quantidade,
    subtotal: preco * row.quantidade,
    produto: {
      id: row.produto.id,
      nome: row.produto.nome,
      preco,
      imagemUrl: row.produto.imagemUrl,
      videoUrl: row.produto.videoUrl
    }
  };
}

async function getClientByNome(nome: string) {
  return prisma.clientUser.findUnique({
    where: { nome }
  });
}

async function getOpenPedido(clientUserId: number) {
  return prisma.pedido.findFirst({
    where: {
      clientUserId,
      status: 'PENDENTE_DE_ENVIO'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getCartSummary(nome: string): Promise<CartSummary | null> {
  const client = await getClientByNome(nome);

  if (!client || !client.ativo) {
    return null;
  }

  const pedido = await getOpenPedido(client.id);

  if (!pedido) {
    return { items: [], total: 0 };
  }

  const rows = await prisma.pedidoItem.findMany({
    where: { pedidoId: pedido.id },
    include: {
      produto: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const items = rows.map(mapCartRow);

  return {
    items,
    total: items.reduce((acc, item) => acc + item.subtotal, 0)
  };
}

export async function addCartItem(nome: string, produtoId: number, quantidade: number): Promise<CartSummary | null> {
  const client = await getClientByNome(nome);

  if (!client || !client.ativo) {
    return null;
  }

  const produto = await prisma.produto.findUnique({
    where: { id: produtoId }
  });

  if (!produto || !produto.ativo) {
    throw new Error('Produto nao encontrado');
  }

  let pedido = await getOpenPedido(client.id);

  if (!pedido) {
    pedido = await prisma.pedido.create({
      data: {
        numero: `PED-${Date.now()}`,
        contato: client.contato,
        status: 'PENDENTE_DE_ENVIO',
        clientUserId: client.id
      }
    });
  }

  const existing = await prisma.pedidoItem.findUnique({
    where: {
      pedidoId_produtoId: {
        pedidoId: pedido.id,
        produtoId
      }
    }
  });

  if (existing) {
    await prisma.pedidoItem.update({
      where: { id: existing.id },
      data: {
        quantidade: existing.quantidade + quantidade
      }
    });
  } else {
    await prisma.pedidoItem.create({
      data: {
        pedidoId: pedido.id,
        produtoId,
        quantidade
      }
    });
  }

  return getCartSummary(nome);
}

export async function updateCartItem(nome: string, itemId: number, quantidade: number): Promise<CartSummary | null> {
  const client = await getClientByNome(nome);

  if (!client || !client.ativo) {
    return null;
  }

  const pedido = await getOpenPedido(client.id);

  if (!pedido) {
    throw new Error('Item do carrinho nao encontrado');
  }

  const item = await prisma.pedidoItem.findFirst({
    where: {
      id: itemId,
      pedidoId: pedido.id
    }
  });

  if (!item) {
    throw new Error('Item do carrinho nao encontrado');
  }

  await prisma.pedidoItem.update({
    where: { id: item.id },
    data: { quantidade }
  });

  return getCartSummary(nome);
}

export async function removeCartItem(nome: string, itemId: number): Promise<CartSummary | null> {
  const client = await getClientByNome(nome);

  if (!client || !client.ativo) {
    return null;
  }

  const pedido = await getOpenPedido(client.id);

  if (!pedido) {
    throw new Error('Item do carrinho nao encontrado');
  }

  const item = await prisma.pedidoItem.findFirst({
    where: {
      id: itemId,
      pedidoId: pedido.id
    }
  });

  if (!item) {
    throw new Error('Item do carrinho nao encontrado');
  }

  await prisma.pedidoItem.delete({
    where: { id: item.id }
  });

  const remainingItems = await prisma.pedidoItem.count({
    where: { pedidoId: pedido.id }
  });

  if (remainingItems === 0) {
    await prisma.pedido.delete({ where: { id: pedido.id } });
  }

  return getCartSummary(nome);
}
