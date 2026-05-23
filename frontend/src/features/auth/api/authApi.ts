import axiosInstance from '@/lib/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';
import { getImageUrl } from '@/utils/getImageUrl';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeUserAvatar(data: AuthResponse): AuthResponse {
  if (data.data.user.avatar) {
    data.data.user.avatar = getImageUrl(data.data.user.avatar);
  }
  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return normalizeUserAvatar(response.data);
  },

  register: async (dataInput: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', dataInput);
    return normalizeUserAvatar(response.data);
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return normalizeUserAvatar(response.data);
  },

  // Không chỉ xóa token ở local mà còn báo cho server biết để hủy token.
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
