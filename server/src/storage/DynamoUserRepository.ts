// STUB: not connected to AWS.
// Target table "gatewise-users", partition key "id", GSI on "username".
import { User } from '../types';
import { IUserRepository } from './IUserRepository';

export class DynamoUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    // TODO: DynamoDB Scan on gatewise-users
    throw new Error('Not implemented');
  }

  async findById(_id: string): Promise<User | undefined> {
    // TODO: DynamoDB GetItem by id
    throw new Error('Not implemented');
  }

  async findByUsername(_username: string): Promise<User | undefined> {
    // TODO: DynamoDB Query on the username GSI
    throw new Error('Not implemented');
  }

  async create(_user: User): Promise<User> {
    // TODO: DynamoDB PutItem
    throw new Error('Not implemented');
  }

  async update(_id: string, _patch: Partial<User>): Promise<User | undefined> {
    // TODO: DynamoDB UpdateItem
    throw new Error('Not implemented');
  }

  async delete(_id: string): Promise<boolean> {
    // TODO: DynamoDB DeleteItem
    throw new Error('Not implemented');
  }
}
