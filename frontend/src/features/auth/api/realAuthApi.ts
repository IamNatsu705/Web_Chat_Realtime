import axiosInstance from '@/lib/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';
import { getImageUrl } from '@/utils/getImageUrl';

export const realAuthApi = {

  //Tên_Method: async (Tham_số: Kiểu_Dữ_Liệu): Promise<Kiểu_Trả_Về> => { ... }
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    const data = response.data;

    if (data.data.user.avatar) {
      data.data.user.avatar = getImageUrl(data.data.user.avatar);
    }

    return data;
  },

  register: async (dataInput: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', dataInput);

    const data = response.data;

    if (data.data.user.avatar) {
      data.data.user.avatar = getImageUrl(data.data.user.avatar);
    }

    return data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');

    const data = response.data;

    if (data.data.user.avatar) {
      data.data.user.avatar = getImageUrl(data.data.user.avatar);
    }

    return data;
  },
  //Không chỉ xóa token ở local mà còn báo cho server biết để hủy token.
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
