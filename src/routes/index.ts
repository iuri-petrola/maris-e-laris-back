import { Router } from 'express';
import { adminLogin } from '../controllers/authController';
import { health } from '../controllers/healthController';
import {
  createProdutoItem,
  deleteProdutoItem,
  listAdminProdutos,
  listProdutos,
  reactivateProdutoItem,
  updateProdutoItem
} from '../controllers/produtoController';
import { uploadProduto } from '../lib/uploadProduto';
import { requireAdminAuth } from '../middlewares/authMiddleware';

export const router = Router();

router.get('/health', health);
router.post('/admin/login', adminLogin);
router.get('/admin/produtos', requireAdminAuth, listAdminProdutos);
router.get('/produtos', listProdutos);
router.post('/produtos', requireAdminAuth, uploadProduto.single('image'), createProdutoItem);
router.put('/produtos/:id', requireAdminAuth, uploadProduto.single('image'), updateProdutoItem);
router.delete('/produtos/:id', requireAdminAuth, deleteProdutoItem);
router.patch('/produtos/:id/reactivate', requireAdminAuth, reactivateProdutoItem);
