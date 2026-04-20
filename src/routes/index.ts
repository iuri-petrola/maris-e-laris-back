import { Router } from 'express';
import { listAdminPedidos, updatePedidoStatus } from '../controllers/adminPedidoController';
import { adminLogin, clientContactLogin, clientLogin } from '../controllers/authController';
import { health } from '../controllers/healthController';
import { getClientMe, registerClientUser } from '../controllers/clientUserController';
import {
  createClientCartItem,
  deleteClientCartItem,
  getClientCart,
  updateClientCartItem
} from '../controllers/cartController';
import { createPublicPedido, listClientPedidos, markClientPedidoAsEnviado, removeClientPedidoItem } from '../controllers/pedidoController';
import {
  createProdutoItem,
  deleteProdutoItem,
  listAdminProdutos,
  listProdutos,
  reactivateProdutoItem,
  updateProdutoItem
} from '../controllers/produtoController';
import { uploadProduto } from '../lib/uploadProduto';
import { requireAdminAuth, requireClientAuth } from '../middlewares/authMiddleware';

export const router = Router();

router.get('/health', health);
router.post('/admin/login', adminLogin);
router.post('/client/login', clientLogin);
router.post('/client/contact-login', clientContactLogin);
router.get('/client/me', requireClientAuth, getClientMe);
router.get('/client/cart', requireClientAuth, getClientCart);
router.post('/client/cart/items', requireClientAuth, createClientCartItem);
router.patch('/client/cart/items/:id', requireClientAuth, updateClientCartItem);
router.delete('/client/cart/items/:id', requireClientAuth, deleteClientCartItem);
router.post('/client-users/register', registerClientUser);
router.post('/pedidos', createPublicPedido);
router.get('/client/pedidos', requireClientAuth, listClientPedidos);
router.patch('/client/pedidos/:numero/enviar', requireClientAuth, markClientPedidoAsEnviado);
router.delete('/client/pedidos/:numero/produtos/:produtoId', requireClientAuth, removeClientPedidoItem);
router.get('/admin/pedidos', requireAdminAuth, listAdminPedidos);
router.patch('/admin/pedidos/:numero/status', requireAdminAuth, updatePedidoStatus);
router.get('/admin/produtos', requireAdminAuth, listAdminProdutos);
router.get('/produtos', listProdutos);
router.post(
  '/produtos',
  requireAdminAuth,
  uploadProduto.fields([{ name: 'image', maxCount: 1 }]),
  createProdutoItem
);
router.put(
  '/produtos/:id',
  requireAdminAuth,
  uploadProduto.fields([{ name: 'image', maxCount: 1 }]),
  updateProdutoItem
);
router.delete('/produtos/:id', requireAdminAuth, deleteProdutoItem);
router.patch('/produtos/:id/reactivate', requireAdminAuth, reactivateProdutoItem);
