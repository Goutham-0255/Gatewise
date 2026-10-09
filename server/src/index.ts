import express from 'express';
import cors from 'cors';
import { env } from './config/env';

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(env.port, () => console.log(`Gatewise API on http://localhost:${env.port}`));
