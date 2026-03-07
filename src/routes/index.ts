import { Router } from 'express';
import { health } from '../controllers/healthController';
import { createProdutoItem, listProdutos } from '../controllers/produtoController';
import { uploadProduto } from '../lib/uploadProduto';

export const router = Router();

router.get('/health', health);
router.get('/produtos', listProdutos);
router.post('/produtos', uploadProduto.single('image'), createProdutoItem);
