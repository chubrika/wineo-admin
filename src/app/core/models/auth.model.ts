export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface MeResponse {
  user: AuthUser;
}
