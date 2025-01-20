export type UserRole = 'ADMIN' | 'SECRETAIRE' | 'PROFESSEUR';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
}