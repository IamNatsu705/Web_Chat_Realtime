import axiosInstance from '@/lib/axios';
import type { User } from '../../auth/types';
import type { ProfileResponse, UpdateProfileRequest, UpdatePasswordRequest } from '../types';
import type { Post } from '../../post/types';
import { getImageUrl } from '@/utils/getImageUrl';

// ─── API Hồ sơ cá nhân ───────────────────────────────────────────────────────

export const profileApi = {
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

    const responseData = response.data;
    if (responseData.data?.user?.avatar) {
      responseData.data.user.avatar = getImageUrl(responseData.data.user.avatar);
    }

    return responseData;
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<ProfileResponse<null>> => {
    const response = await axiosInstance.put<ProfileResponse<null>>('/profile/password', data);
    return response.data;
  },

  getMyPosts: async (): Promise<ProfileResponse<{ posts: Post[] }>> => {
    const response = await axiosInstance.get<ProfileResponse<{ posts: Post[] }>>('/profile/posts');

    const responseData = response.data;

    if (responseData.data?.posts && Array.isArray(responseData.data.posts)) {
      responseData.data.posts.forEach((post) => {
        if (post.user?.avatar) post.user.avatar = getImageUrl(post.user.avatar);
      });
    }

    return responseData;
  },
};
