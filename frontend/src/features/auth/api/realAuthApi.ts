import axiosInstance from '@/lib/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

export const realAuthApi = {

  //Tên_Method: async (Tham_số: Kiểu_Dữ_Liệu): Promise<Kiểu_Trả_Về> => { ... }

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Some laravel sanctum setups require fetching CSRF cookie first, optional depending on setup
    // await axiosInstance.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return response.data;
  },
  //Không chỉ xóa token ở local mà còn báo cho server biết để hủy token.
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
