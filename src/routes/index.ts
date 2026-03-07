import { Router } from 'express';
import { health } from '../controllers/healthController';
import { listProdutos } from '../controllers/produtoController';

export const router = Router();

router.get('/health', health);
router.get('/produtos', listProdutos);
