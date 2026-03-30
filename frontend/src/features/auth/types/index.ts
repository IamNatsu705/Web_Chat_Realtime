export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token?: string; // Token might only be present on login/register, not /me
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}
