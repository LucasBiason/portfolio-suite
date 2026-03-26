import { Router } from 'express';
import { StackController } from '../controllers/StackController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new StackController();

// Public route for portfolio display
router.get('/', controller.listPublic);
// Admin filtered listing
router.get('/admin', authMiddleware, controller.listAdmin);
// Protected routes for CRUD operations
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
