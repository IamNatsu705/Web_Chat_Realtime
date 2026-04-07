import axiosInstance from '@/lib/axios';
import type { User } from '../../auth/types';
import type { ProfileResponse, Post, UpdateProfileRequest, UpdatePasswordRequest } from '../types';

export const realProfileApi = {
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse<{ user: User }>> => {
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.avatar instanceof File) {
      formData.append('avatar', data.avatar);
    }

    const response = await axiosInstance.post<ProfileResponse<{ user: User }>>(
      '/profile/update',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<ProfileResponse<null>> => {
    const response = await axiosInstance.put<ProfileResponse<null>>('/profile/password', data);
    return response.data;
  },

  getMyPosts: async (): Promise<ProfileResponse<{ posts: Post[] }>> => {
    const response = await axiosInstance.get<ProfileResponse<{ posts: Post[] }>>('/profile/posts');
    return response.data;
  },
};
