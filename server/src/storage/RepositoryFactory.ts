import { env } from '../config/env';
import { DynamoUserRepository } from './DynamoUserRepository';
import { IUserRepository } from './IUserRepository';
import { JsonUserRepository } from './JsonUserRepository';

export function createUserRepository(): IUserRepository {
  return env.storageAdapter === 'dynamo' ? new DynamoUserRepository() : new JsonUserRepository();
}
