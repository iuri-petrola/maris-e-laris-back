import { Router } from 'express';
import { adminLogin, clientLogin } from '../controllers/authController';
import { health } from '../controllers/healthController';
import { getClientMe, registerClientUser } from '../controllers/clientUserController';
import {
  createClientCartItem,
  deleteClientCartItem,
  getClientCart,
  updateClientCartItem
} from '../controllers/cartController';
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
router.get('/client/me', requireClientAuth, getClientMe);
router.get('/client/cart', requireClientAuth, getClientCart);
router.post('/client/cart/items', requireClientAuth, createClientCartItem);
router.patch('/client/cart/items/:id', requireClientAuth, updateClientCartItem);
router.delete('/client/cart/items/:id', requireClientAuth, deleteClientCartItem);
router.post('/client-users/register', registerClientUser);
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
