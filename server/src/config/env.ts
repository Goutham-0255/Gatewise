import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET is required');

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret,
  storageAdapter: process.env.STORAGE_ADAPTER ?? 'json',
  // Comma-separated list of browser origins allowed by CORS
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
