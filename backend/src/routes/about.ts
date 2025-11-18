import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ProfileController();

router.get('/', authMiddleware, controller.getAbout);

export default router;
