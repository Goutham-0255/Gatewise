import fs from 'fs/promises';
import path from 'path';
import { RecordItem } from '../types';
import { IRecordRepository } from './IRecordRepository';

const file = path.join(__dirname, '../data/records.json');

// Read-only for now. Any write added later must use the temp-file + rename pattern
// from JsonUserRepository so a crash never leaves a half-written records.json.
export class JsonRecordRepository implements IRecordRepository {
  private async read(): Promise<RecordItem[]> {
    return JSON.parse(await fs.readFile(file, 'utf-8'));
  }

  async findAll(): Promise<RecordItem[]> {
    return this.read();
  }

  async findByUserId(userId: string): Promise<RecordItem[]> {
    return (await this.read()).filter((r) => r.userId === userId);
  }
}
