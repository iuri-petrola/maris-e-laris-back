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

export async function getCartSummary(nome: string): Promise<CartSummary | null> {
  const client = await getClientByNome(nome);

  if (!client || !client.ativo) {
    return null;
  }

  const rows = await prisma.cartItem.findMany({
    where: { clientUserId: client.id },
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

  const existing = await prisma.cartItem.findUnique({
    where: {
      clientUserId_produtoId: {
        clientUserId: client.id,
        produtoId
      }
    }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantidade: existing.quantidade + quantidade
      }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        clientUserId: client.id,
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

  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      clientUserId: client.id
    }
  });

  if (!item) {
    throw new Error('Item do carrinho nao encontrado');
  }

  await prisma.cartItem.update({
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

  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      clientUserId: client.id
    }
  });

  if (!item) {
    throw new Error('Item do carrinho nao encontrado');
  }

  await prisma.cartItem.delete({
    where: { id: item.id }
  });

  return getCartSummary(nome);
}
