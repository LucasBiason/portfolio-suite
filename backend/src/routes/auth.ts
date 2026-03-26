import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const controller = new AuthController();

// Registro desabilitado em produção - usar scripts/create-user.ts
if (process.env.NODE_ENV !== 'production') {
  router.post('/register', controller.register);
}
router.post('/login', controller.login);

export default router;

