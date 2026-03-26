import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new SettingsController();

router.get('/public', controller.getPublic);
router.get('/', authMiddleware, controller.get);
router.put('/', authMiddleware, controller.update);
router.post('/test-email', authMiddleware, controller.testEmail);

export default router;
