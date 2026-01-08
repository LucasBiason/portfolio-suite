import { Router, Request, Response } from 'express';
import { ContactController } from '../controllers/ContactController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { sendContactEmail } from '../services/email';

const router = Router();
const controller = new ContactController();

// Public route for portfolio display
router.get('/info', controller.listPublic);
// Protected routes for CRUD operations
router.post('/info', authMiddleware, controller.create);
router.put('/info/:id', authMiddleware, controller.update);
router.delete('/info/:id', authMiddleware, controller.delete);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    await sendContactEmail({ name, email, message });
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
