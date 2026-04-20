import { prisma } from '../lib/prisma';

export type AdminPedidoItem = {
  id: number;
  numero: string;
  status: string;
  contato: string;
  createdAt: string;
  quantidade: number;
  clientUser: {
    id: number;
    nome: string;
    contato: string;
  };
  produto: {
    id: number;
    nome: string;
    preco: number;
    imagemUrl: string;
    videoUrl: string | null;
  };
};

export async function getAdminPedidos(): Promise<AdminPedidoItem[]> {
  const rows = await prisma.pedidoItem.findMany({
    include: {
      pedido: {
        include: {
          clientUser: true
        }
      },
      produto: true
    },
    orderBy: [
      { pedido: { createdAt: 'desc' } },
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
    clientUser: {
      id: row.pedido.clientUser.id,
      nome: row.pedido.clientUser.nome,
      contato: row.pedido.clientUser.contato
    },
    produto: {
      id: row.produto.id,
      nome: row.produto.nome,
      preco: Number(row.produto.preco),
      imagemUrl: row.produto.imagemUrl,
      videoUrl: row.produto.videoUrl
    }
  }));
}

type UpdatePedidoStatusInput = {
  numero: string;
  status: string;
};

const ALLOWED_PEDIDO_STATUS = ['PENDENTE_DE_ENVIO', 'ENVIADO', 'EM_ATENDIMENTO', 'FINALIZADO'] as const;

export async function updateAdminPedidoStatus(input: UpdatePedidoStatusInput): Promise<void> {
  if (!ALLOWED_PEDIDO_STATUS.includes(input.status as (typeof ALLOWED_PEDIDO_STATUS)[number])) {
    throw new Error('Status invalido');
  }

  const updated = await prisma.pedido.updateMany({
    where: { numero: input.numero },
    data: { status: input.status }
  });

  if (updated.count === 0) {
    throw new Error('Pedido nao encontrado');
  }
}
