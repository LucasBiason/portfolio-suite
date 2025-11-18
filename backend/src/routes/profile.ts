import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ProfileController();

router.get('/', authMiddleware, controller.getProfile);
router.get('/about', authMiddleware, controller.getAbout);
router.put('/', authMiddleware, controller.updateProfile);

export default router;

