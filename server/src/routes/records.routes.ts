import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { delay } from '../middleware/delay.middleware';
import { createRecordRepository } from '../storage/RepositoryFactory';

const router = Router();
const records = createRecordRepository();

// Authenticate first so anonymous callers can never trigger a delay
router.use(authenticate, delay);

router.get('/', async (req, res) => {
  try {
    const { role, userId } = req.user!;
    res.json(role === 'Admin' ? await records.findAll() : await records.findByUserId(userId));
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
