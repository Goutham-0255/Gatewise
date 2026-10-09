import fs from 'fs/promises';
import path from 'path';
import { User } from '../types';
import { IUserRepository } from './IUserRepository';

const file = path.join(__dirname, '../data/users.json');

export class JsonUserRepository implements IUserRepository {
  private async read(): Promise<User[]> {
    return JSON.parse(await fs.readFile(file, 'utf-8'));
  }

  // Write to a temp file then rename, so a crash never leaves a half-written users.json
  private async write(users: User[]): Promise<void> {
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(users, null, 2));
    await fs.rename(tmp, file);
  }

  async findAll(): Promise<User[]> {
    return this.read();
  }

  async findById(id: string): Promise<User | undefined> {
    return (await this.read()).find((u) => u.id === id);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return (await this.read()).find((u) => u.username === username);
  }

  async create(user: User): Promise<User> {
    const all = await this.read();
    all.push(user);
    await this.write(all);
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const all = await this.read();
    const i = all.findIndex((u) => u.id === id);
    if (i === -1) return undefined;
    all[i] = { ...all[i], ...patch, id };
    await this.write(all);
    return all[i];
  }

  async delete(id: string): Promise<boolean> {
    const all = await this.read();
    const remaining = all.filter((u) => u.id !== id);
    if (remaining.length === all.length) return false;
    await this.write(remaining);
    return true;
  }
}
