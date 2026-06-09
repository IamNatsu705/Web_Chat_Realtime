export interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string | null;
  bio?: string | null;
  student_id?: string | null;
  department?: string | null;
  role?: 'user' | 'admin';
  last_seen_at?: string | null;
  created_at?: string;
  updated_at?: string;
  is_banned?: boolean;
  banned_at?: string | null;
  ban_reason?: string | null;
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
  student_id?: string;
  department?: string;
}
