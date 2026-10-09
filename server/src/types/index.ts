export type Role = 'General User' | 'Admin';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  email: string;
  createdAt: string;
}

export interface RecordItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: Role;
}
