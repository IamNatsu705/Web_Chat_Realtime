import type { User } from '../../auth/types';
import type { ApiResponse } from '@/types/api';

// Re-export Post từ post/types (dùng chung, tránh duplicate)
export type { Post } from '../../post/types';

/**
 * ProfileResponse = ApiResponse nhưng giữ alias cho rõ ràng trong context profile.
 * Lý do: các component profile đã quen dùng ProfileResponse, đổi tên gây churn không cần thiết.
 */
export type ProfileResponse<T> = ApiResponse<T>;

export interface UpdateProfileRequest {
  name: string;
  avatar?: File | string | null;
}

export interface UpdatePasswordRequest {
  old_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

// Re-export User để profile components không phải import cross-feature
export type { User };
