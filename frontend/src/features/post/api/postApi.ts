import axiosInstance from '@/lib/axios';
import { getImageUrl } from '@/utils/getImageUrl';
import type { ApiResponse } from '@/types/api';
import type { Post, Comment, FeedPage } from '../types';

// Re-export types for backward compatibility
export type { Post, Comment, FeedPage, ApiResponse };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePost(post: Post): Post {
  if (post.user?.avatar) post.user.avatar = getImageUrl(post.user.avatar);
  if (post.media) {
    post.media.forEach(m => {
      if (m.media_url) m.media_url = getImageUrl(m.media_url);
    });
  }
  return post;
}

// ─── Post API ─────────────────────────────────────────────────────────────────

/**
 * postApi - Chịu trách nhiệm tương tác Backend cho các tính năng Bài viết (Posts),
 * Comments, và Lượt thích (Likes).
 */
export const postApi = {
  /**
   * Lấy danh sách bài viết (New Feed) sử dụng phân trang Cursor.
   * @param cursor Con trỏ phân trang (thường là encoded string trả về từ server). Bỏ trống nếu lấy trang đầu.
   * @returns Danh sách bài viết và thông tin trang tiếp theo.
   */
  getFeed: async (cursor?: string | null): Promise<ApiResponse<FeedPage>> => {
    const params: Record<string, string> = {};
    if (cursor) params.cursor = cursor;

    const res = await axiosInstance.get<ApiResponse<FeedPage>>('/posts/feed', { params });
    res.data.data?.posts?.forEach(normalizePost);
    return res.data;
  },

  /**
   * Lấy chi tiết một bài viết cụ thể theo ID.
   * @param postId ID của bài viết cần lấy.
   */
  getPost: async (postId: number): Promise<ApiResponse<{ post: Post }>> => {
    const res = await axiosInstance.get<ApiResponse<{ post: Post }>>(`/posts/${postId}`);
    if (res.data.data?.post) normalizePost(res.data.data.post);
    return res.data;
  },

  /**
   * Tạo bài viết mới, hỗ trợ đính kèm nhiều file hình ảnh/video (FormData).
   * @param content Nội dung chữ của bài viết.
   * @param mediaFiles (Tùy chọn) Mảng các file đa phương tiện đính kèm.
   */
  createPost: async (content: string, mediaFiles?: File[]): Promise<ApiResponse<{ post: Post }>> => {
    const formData = new FormData();
    formData.append('content', content);
    if (mediaFiles) {
      mediaFiles.forEach(file => formData.append('media[]', file));
    }

    const res = await axiosInstance.post<ApiResponse<{ post: Post }>>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.data?.post) normalizePost(res.data.data.post);
    return res.data;
  },

  /**
   * Cập nhật nội dung chữ của bài viết.
   * Lưu ý: Hiện tại Backend chỉ cho phép cập nhật chữ, không cập nhật media.
   * @param postId ID bài viết.
   * @param content Nội dung chữ mới.
   */
  updatePost: async (postId: number, content: string): Promise<ApiResponse<{ post: Post }>> => {
    const res = await axiosInstance.put<ApiResponse<{ post: Post }>>(`/posts/${postId}`, { content });
    if (res.data.data?.post) normalizePost(res.data.data.post);
    return res.data;
  },

  /**
   * Xóa một bài viết (Chỉ chủ bài viết hoặc Admin mới có quyền).
   * @param postId ID của bài viết cần xóa.
   */
  deletePost: async (postId: number): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.delete<ApiResponse<null>>(`/posts/${postId}`);
    return res.data;
  },

  /**
   * Toggle (Thích/Bỏ thích) một bài viết.
   * @param postId ID của bài viết.
   * @returns Trạng thái đã thích (`liked`) và tổng số likes (`likes_count`).
   */
  toggleLike: async (postId: number): Promise<ApiResponse<{ liked: boolean; likes_count: number }>> => {
    const res = await axiosInstance.post<ApiResponse<{ liked: boolean; likes_count: number }>>(
      `/posts/${postId}/like`
    );
    return res.data;
  },

  /**
   * Lấy danh sách bình luận của bài viết (Phân trang theo số trang).
   * @param postId ID của bài viết.
   * @param page Số trang cần lấy (Mặc định: 1).
   */
  getComments: async (postId: number, page = 1): Promise<ApiResponse<{
    comments: Comment[];
    current_page: number;
    last_page: number;
  }>> => {
    const res = await axiosInstance.get(`/posts/${postId}/comments`, { params: { page } });
    return res.data;
  },

  /**
   * Gửi một bình luận mới vào bài viết.
   * Hỗ trợ bình luận lồng nhau (Reply) nếu truyền `parentId`.
   * @param postId ID bài viết.
   * @param content Nội dung bình luận.
   * @param parentId (Tùy chọn) ID của bình luận cha nếu đây là một phản hồi (reply).
   */
  createComment: async (
    postId: number,
    content: string,
    parentId?: number
  ): Promise<ApiResponse<{ comment: Comment }>> => {
    const body: Record<string, unknown> = { content };
    if (parentId) body.parent_id = parentId;

    const res = await axiosInstance.post<ApiResponse<{ comment: Comment }>>(
      `/posts/${postId}/comments`,
      body
    );
    return res.data;
  },

  /**
   * Xóa bình luận.
   * @param commentId ID bình luận cần xóa.
   */
  deleteComment: async (commentId: number): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.delete<ApiResponse<null>>(`/posts/comments/${commentId}`);
    return res.data;
  },

  /**
   * Lấy danh sách tất cả các bài viết thuộc về một người dùng cụ thể (Dùng trong trang Profile cá nhân).
   * @param userId ID người dùng.
   * @param page Số trang hiện tại.
   */
  getUserPosts: async (userId: number, page = 1): Promise<ApiResponse<{
    posts: Post[];
    current_page: number;
    last_page: number;
  }>> => {
    const res = await axiosInstance.get(`/users/${userId}/posts`, { params: { page } });
    res.data.data?.posts?.forEach(normalizePost);
    return res.data;
  },
};
