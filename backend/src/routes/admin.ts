import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { prisma } from '../config/prisma';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (_req: Request, res: Response) => {
  const [users, projects, services, experiences] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.service.count(),
    prisma.experience.count(),
  ]);

  res.json({
    users,
    projects,
    services,
    experiences,
    timestamp: new Date().toISOString(),
  });
});

export default router;


