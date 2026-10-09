import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import recordsRoutes from './routes/records.routes';
import { authenticate } from './middleware/auth.middleware';

const app = express();
// An array (not a string) makes cors omit the allow-origin header for unknown origins
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);
app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(env.port, () => console.log(`Gatewise API on http://localhost:${env.port}`));
