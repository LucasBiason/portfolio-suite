import { Router } from 'express';
import { StatsController } from '../controllers/StatsController';

const router = Router();
const controller = new StatsController();

// Public route — no authentication required
router.get('/public', controller.getPublic);

export default router;
