import { Router } from 'express';
import { EducationController } from '../controllers/EducationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new EducationController();

router.get('/', controller.listPublic);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
