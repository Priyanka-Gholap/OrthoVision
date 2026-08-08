export type UserRole = 'Patient' | 'Doctor' | 'Admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
