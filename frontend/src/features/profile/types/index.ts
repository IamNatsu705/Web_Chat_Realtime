import type { User } from '../../auth/types';

export interface ProfileResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  media_url?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface UpdateProfileRequest {
  name: string;
  avatar?: File | string | null;
}

export interface UpdatePasswordRequest {
  old_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}
