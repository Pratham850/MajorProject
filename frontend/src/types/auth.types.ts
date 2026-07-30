export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'RESEARCHER'
  | 'ADMIN'
  | 'patient'
  | 'doctor'
  | 'researcher'
  | 'admin';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface TokenResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}
