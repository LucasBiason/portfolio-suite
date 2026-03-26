import { Router } from 'express';
import { CareerController } from '../controllers/CareerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new CareerController();

// Public route for portfolio display
router.get('/', controller.listPublic);
// Admin route: filtered + paginated listing (must be before /:id)
router.get('/admin', authMiddleware, controller.listAdmin);
// Protected routes for CRUD operations
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
