import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { createUserRepository } from '../storage/RepositoryFactory';
import { JWTPayload } from '../types';

const router = Router();
const users = createUserRepository();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Compared against when the username is unknown, so both failure paths take the same bcrypt time
const DUMMY_HASH = bcrypt.hashSync('dummy', 10);

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }
    const { username, password } = parsed.data;

    const user = await users.findByUsername(username);
    const ok = (await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)) && !!user;
    if (!ok || !user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Role always comes from the stored user, never from the request body
    const payload: JWTPayload = { userId: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, env.jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, email: user.email },
    });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
