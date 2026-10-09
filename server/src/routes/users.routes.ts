import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { z, ZodError } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { createUserRepository } from '../storage/RepositoryFactory';
import { User } from '../types';

const router = Router();
const users = createUserRepository();

// The Admin check trusts the role inside the JWT (valid for 1h). The server, not the client,
// is the source of truth: a demoted user keeps Admin access only until their token expires.
router.use(authenticate, requireRole('Admin'));

const createSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['Admin', 'General User']),
});

const updateSchema = createSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' });

const toPublic = (user: User) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const validationErrors = (error: ZodError) => ({
  message: 'Validation failed',
  errors: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
});

const isUsernameTaken = (all: User[], username: string, exceptId?: string) =>
  all.some((u) => u.id !== exceptId && u.username.toLowerCase() === username.toLowerCase());

const countAdmins = (all: User[]) => all.filter((u) => u.role === 'Admin').length;

router.get('/', async (_req, res) => {
  try {
    res.json((await users.findAll()).map(toPublic));
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(validationErrors(parsed.error));
      return;
    }
    const { username, email, password, role } = parsed.data;

    if (isUsernameTaken(await users.findAll(), username)) {
      res.status(409).json({ message: 'Username already exists' });
      return;
    }

    const user: User = {
      id: randomUUID(),
      username,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      createdAt: new Date().toISOString(),
    };
    await users.create(user);
    res.status(201).json(toPublic(user));
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(validationErrors(parsed.error));
      return;
    }
    const { password, ...fields } = parsed.data;

    const all = await users.findAll();
    const target = all.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (fields.username && isUsernameTaken(all, fields.username, target.id)) {
      res.status(409).json({ message: 'Username already exists' });
      return;
    }

    if (target.role === 'Admin' && fields.role === 'General User' && countAdmins(all) === 1) {
      res.status(400).json({ message: 'Cannot demote the last Admin' });
      return;
    }

    const patch: Partial<User> = { ...fields };
    if (password) patch.passwordHash = await bcrypt.hash(password, 10);

    const updated = await users.update(target.id, patch);
    res.json(toPublic(updated!));
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const all = await users.findAll();
    const target = all.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (target.id === req.user!.userId) {
      res.status(400).json({ message: 'You cannot delete your own account' });
      return;
    }

    if (target.role === 'Admin' && countAdmins(all) === 1) {
      res.status(400).json({ message: 'Cannot delete the last Admin' });
      return;
    }

    await users.delete(target.id);
    res.status(204).end();
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
