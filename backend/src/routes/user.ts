import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ProfileController();

// Public route for portfolio display
router.get('/', controller.getPublicProfile);
// Protected route for authenticated users
router.get('/me', authMiddleware, controller.getProfile);

export default router;
