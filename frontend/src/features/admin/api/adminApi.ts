import axiosInstance from '@/lib/axios';
import type { Post } from '@/features/post/types';
import type { ApiResponse } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'admin';
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  new_users_week: number;
  total_posts: number;
  new_posts_week: number;
  total_messages: number;
  banned_users: number;

  // Trend comparison
  prev_users_week: number;
  prev_posts_week: number;

  // Extra metrics
  hidden_posts_count: number;
  active_users_today: number;

  // Chart data
  daily_stats: Array<{
    date: string;
    users: number;
    posts: number;
    messages: number;
  }>;

  // Top engagement posts
  top_posts: Array<{
    id: number;
    content: string;
    status: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user: { id: number; name: string; avatar: string | null } | null;
  }>;

  // Most active users
  most_active_users: Array<{
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    is_banned: boolean;
    posts_count: number;
    messages_count: number;
  }>;
}

// Re-export for backward compatibility
export type { Post, ApiResponse };

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return res.data;
  },

  getUsers: async (page = 1, search?: string, status?: string): Promise<ApiResponse<{
    users: AdminUser[];
    current_page: number;
    last_page: number;
    total: number;
  }>> => {
    const params: Record<string, string | number> = { page };
    if (search) params.search = search;
    if (status) params.status = status;
    const res = await axiosInstance.get('/admin/users', { params });
    return res.data;
  },

  banUser: async (userId: number, reason: string): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.post<ApiResponse<null>>(`/admin/users/${userId}/ban`, { reason });
    return res.data;
  },

  unbanUser: async (userId: number): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.post<ApiResponse<null>>(`/admin/users/${userId}/unban`);
    return res.data;
  },

  getPosts: async (page = 1, status?: string, search?: string): Promise<ApiResponse<{
    posts: Post[];
    current_page: number;
    last_page: number;
    total: number;
  }>> => {
    const params: Record<string, string | number> = { page };
    if (status) params.status = status;
    if (search) params.search = search;
    const res = await axiosInstance.get('/admin/posts', { params });
    return res.data;
  },

  hidePost: async (postId: number, reason: string): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.put<ApiResponse<null>>(`/admin/posts/${postId}/hide`, { reason });
    return res.data;
  },

  restorePost: async (postId: number): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.put<ApiResponse<null>>(`/admin/posts/${postId}/restore`);
    return res.data;
  },
};
