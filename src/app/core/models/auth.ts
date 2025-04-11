export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User | null;
  error?: Error;
}

export interface AuthError {
  message: string;
  status?: number;
}
