import { Role } from '../services/auth.service';

/** A user as the API returns it (the server never sends passwordHash). */
export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
