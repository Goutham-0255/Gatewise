import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const hash = bcrypt.hashSync('password123', 10);
const now = new Date().toISOString();

const users = [
  { id: 'u1', username: 'admin', passwordHash: hash, role: 'Admin', email: 'admin@gatewise.dev', createdAt: now },
  { id: 'u2', username: 'john_doe', passwordHash: hash, role: 'General User', email: 'john@gatewise.dev', createdAt: now },
  { id: 'u3', username: 'jane_doe', passwordHash: hash, role: 'General User', email: 'jane@gatewise.dev', createdAt: now },
];

const rec = (id: string, userId: string, title: string, status: 'active' | 'inactive') => ({
  id,
  userId,
  title,
  description: `${title} details`,
  status,
  createdAt: now,
});

const records = [
  rec('r1', 'u2', 'John report Q1', 'active'),
  rec('r2', 'u2', 'John audit', 'inactive'),
  rec('r3', 'u3', 'Jane roadmap', 'active'),
  rec('r4', 'u3', 'Jane review', 'active'),
  rec('r5', 'u1', 'Admin policy', 'active'),
  rec('r6', 'u1', 'Admin backup', 'inactive'),
];

const dir = path.join(__dirname, '../src/data');
fs.writeFileSync(path.join(dir, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(dir, 'records.json'), JSON.stringify(records, null, 2));
console.log('Seeded users.json and records.json');
