import { env } from '../config/env';
import { DynamoUserRepository } from './DynamoUserRepository';
import { IRecordRepository } from './IRecordRepository';
import { IUserRepository } from './IUserRepository';
import { JsonRecordRepository } from './JsonRecordRepository';
import { JsonUserRepository } from './JsonUserRepository';

export function createUserRepository(): IUserRepository {
  return env.storageAdapter === 'dynamo' ? new DynamoUserRepository() : new JsonUserRepository();
}

export function createRecordRepository(): IRecordRepository {
  if (env.storageAdapter === 'dynamo') {
    // TODO: add DynamoRecordRepository
    throw new Error('Dynamo record repository not implemented');
  }
  return new JsonRecordRepository();
}
