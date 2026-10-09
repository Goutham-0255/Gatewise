import { User } from '../types';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | undefined>;
  findByUsername(username: string): Promise<User | undefined>;
  create(user: User): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
}
