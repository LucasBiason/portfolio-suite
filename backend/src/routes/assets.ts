import { Router } from 'express';
import { AssetController } from '../controllers/AssetController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();
const controller = new AssetController();

// Upload de imagem (requer autenticação e arquivo)
router.post('/upload', authMiddleware, uploadMiddleware.single('file'), controller.upload);

// Listar todas as imagens do usuário
router.get('/', authMiddleware, controller.list);

// Obter URL de imagem por tag
router.get('/:tag', authMiddleware, controller.download);

// Remover imagem por tag
router.delete('/:tag', authMiddleware, controller.delete);

export default router;

