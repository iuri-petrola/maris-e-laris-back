import { prisma } from '../lib/prisma';
import { ensureClientUser } from './clientUserService';

export type PedidoItem = {
  id: number;
  numero: string;
  status: string;
  contato: string;
  clientUserId: number;
  createdAt: string;
};

export type ClientPedidoItem = {
  id: number;
  numero: string;
  status: string;
  contato: string;
  createdAt: string;
  quantidade: number;
  produto: {
    id: number;
    nome: string;
    preco: number;
    imagemUrl: string;
    videoUrl: string | null;
  };
};

type CreatePedidoInput = {
  nome: string;
  contato: string;
  produtoId: number;
  numero?: string;
};

function generatePedidoNumero(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `PED-${yyyy}${mm}${dd}-${hh}${min}${ss}${ms}`;
}

function mapPedido(row: {
  id: number;
  numero: string;
  status: string;
  contato: string;
  clientUserId: number;
  createdAt: Date;
}): PedidoItem {
  return {
    id: row.id,
    numero: row.numero,
    status: row.status,
    contato: row.contato,
    clientUserId: row.clientUserId,
    createdAt: row.createdAt.toISOString()
  };
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

export async function createPedido(input: CreatePedidoInput): Promise<PedidoItem> {
  const clientUser = await ensureClientUser(input.nome, input.contato);

  const produto = await prisma.produto.findUnique({
    where: { id: input.produtoId }
  });

  if (!produto || !produto.ativo) {
    throw new Error('Produto nao encontrado');
  }

  let pedido = await getOpenPedido(clientUser.id);

  if (!pedido) {
    pedido = await prisma.pedido.create({
      data: {
        numero: input.numero?.trim() || generatePedidoNumero(),
        contato: input.contato,
        status: 'PENDENTE_DE_ENVIO',
        clientUserId: clientUser.id
      }
    });
  } else if (pedido.contato !== input.contato) {
    pedido = await prisma.pedido.update({
      where: { id: pedido.id },
      data: { contato: input.contato }
    });
  }

  const existingItem = await prisma.pedidoItem.findUnique({
    where: {
      pedidoId_produtoId: {
        pedidoId: pedido.id,
        produtoId: input.produtoId
      }
    }
  });

  if (existingItem) {
    await prisma.pedidoItem.update({
      where: { id: existingItem.id },
      data: {
        quantidade: existingItem.quantidade + 1
      }
    });
  } else {
    await prisma.pedidoItem.create({
      data: {
        pedidoId: pedido.id,
        produtoId: input.produtoId,
        quantidade: 1
      }
    });
  }

  return mapPedido(pedido);
}

export async function getPedidosByClientNome(nome: string): Promise<ClientPedidoItem[] | null> {
  const clientUser = await prisma.clientUser.findUnique({
    where: { nome }
  });

  if (!clientUser || !clientUser.ativo) {
    return null;
  }

  const rows = await prisma.pedidoItem.findMany({
    where: {
      pedido: {
        clientUserId: clientUser.id
      }
    },
    include: {
      pedido: true,
      produto: true
    },
    orderBy: [
      { pedido: { createdAt: 'asc' } },
      { createdAt: 'asc' }
    ]
  });

  return rows.map((row) => ({
    id: row.id,
    numero: row.pedido.numero,
    status: row.pedido.status,
    contato: row.pedido.contato,
    createdAt: row.pedido.createdAt.toISOString(),
    quantidade: row.quantidade,
    produto: {
      id: row.produto.id,
      nome: row.produto.nome,
      preco: Number(row.produto.preco),
      imagemUrl: row.produto.imagemUrl,
      videoUrl: row.produto.videoUrl
    }
  }));
}

export async function removePedidoItemByClient(nome: string, numero: string, produtoId: number): Promise<void> {
  const clientUser = await prisma.clientUser.findUnique({
    where: { nome }
  });

  if (!clientUser || !clientUser.ativo) {
    throw new Error('Cliente nao encontrado');
  }

  const pedido = await prisma.pedido.findFirst({
    where: {
      clientUserId: clientUser.id,
      numero,
      status: 'PENDENTE_DE_ENVIO'
    }
  });

  if (!pedido) {
    throw new Error('Pedido nao encontrado');
  }

  const pedidoItem = await prisma.pedidoItem.findUnique({
    where: {
      pedidoId_produtoId: {
        pedidoId: pedido.id,
        produtoId
      }
    }
  });

  if (!pedidoItem) {
    throw new Error('Item do pedido nao encontrado');
  }

  if (pedidoItem.quantidade > 1) {
    await prisma.pedidoItem.update({
      where: { id: pedidoItem.id },
      data: {
        quantidade: pedidoItem.quantidade - 1
      }
    });
    return;
  }

  await prisma.pedidoItem.delete({
    where: { id: pedidoItem.id }
  });

  const remainingItems = await prisma.pedidoItem.count({
    where: { pedidoId: pedido.id }
  });

  if (remainingItems === 0) {
    await prisma.pedido.delete({
      where: { id: pedido.id }
    });
  }
}

export async function markPedidoAsEnviadoByClient(nome: string, numero: string): Promise<void> {
  const clientUser = await prisma.clientUser.findUnique({
    where: { nome }
  });

  if (!clientUser || !clientUser.ativo) {
    throw new Error('Cliente nao encontrado');
  }

  const updated = await prisma.pedido.updateMany({
    where: {
      clientUserId: clientUser.id,
      numero,
      status: 'PENDENTE_DE_ENVIO'
    },
    data: {
      status: 'ENVIADO'
    }
  });

  if (updated.count === 0) {
    throw new Error('Pedido nao encontrado');
  }
}
