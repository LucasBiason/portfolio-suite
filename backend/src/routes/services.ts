import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ServiceController();

// Public route for portfolio display
router.get('/', controller.listPublic);
// Protected routes for CRUD operations
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
