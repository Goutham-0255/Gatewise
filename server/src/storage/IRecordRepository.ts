import { RecordItem } from '../types';

export interface IRecordRepository {
  findAll(): Promise<RecordItem[]>;
  findByUserId(userId: string): Promise<RecordItem[]>;
}
