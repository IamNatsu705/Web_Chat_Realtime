import axiosInstance from '@/lib/axios';
import type { GroupResource } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * resourceApi — API tài liệu dùng chung cho tất cả loại cuộc trò chuyện.
 * Hoạt động với: DM 1-1, nhóm riêng tư, nhóm cộng đồng.
 * Route: /api/v1/chat/conversations/{conversationId}/resources
 */
export const resourceApi = {
  /**
   * Lấy danh sách tài liệu của cuộc trò chuyện.
   * Hỗ trợ tìm kiếm và lọc theo danh mục.
   */
  getResources: async (
    conversationId: number,
    params?: { search?: string; category?: string; page?: number; per_page?: number }
  ): Promise<{
    resources: GroupResource[];
    pagination: { current_page: number; last_page: number; total: number; per_page: number };
  }> => {
    const res = await axiosInstance.get<ApiResponse<{
      resources: GroupResource[];
      pagination: { current_page: number; last_page: number; total: number; per_page: number };
    }>>(`/chat/conversations/${conversationId}/resources`, { params });
    return res.data.data!;
  },

  /**
   * Upload tài liệu mới vào cuộc trò chuyện.
   * Hỗ trợ file tối đa 50MB với theo dõi tiến trình upload.
   */
  uploadResource: async (
    conversationId: number,
    data: { title: string; description?: string; category?: string; file: File },
    onProgress?: (percent: number) => void
  ): Promise<GroupResource> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    formData.append('file', data.file);

    const res = await axiosInstance.post<ApiResponse<{ resource: GroupResource }>>(
      `/chat/conversations/${conversationId}/resources`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Theo dõi tiến trình upload — hiển thị progress bar cho user
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return res.data.data!.resource;
  },

  /**
   * Lấy URL tải xuống tài liệu.
   * Backend sử dụng StreamedResponse để tránh lag/crash với file lớn.
   */
  getDownloadUrl: (conversationId: number, resourceId: number): string => {
    return `/api/v1/chat/conversations/${conversationId}/resources/${resourceId}/download`;
  },

  /**
   * Tải xuống file tài liệu trực tiếp bằng axios blob (để gửi kèm Authorization Header)
   */
  downloadResourceFile: async (conversationId: number, resourceId: number, filename: string): Promise<void> => {
    const res = await axiosInstance.get(`/chat/conversations/${conversationId}/resources/${resourceId}/download`, {
      responseType: 'blob',
    });
    
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Xóa tài liệu. Người upload hoặc owner/mod mới có quyền.
   */
  deleteResource: async (conversationId: number, resourceId: number): Promise<void> => {
    await axiosInstance.delete(`/chat/conversations/${conversationId}/resources/${resourceId}`);
  },

  /**
   * Ghim hoặc bỏ ghim tài liệu. Chỉ owner/mod mới có quyền.
   */
  togglePin: async (conversationId: number, resourceId: number): Promise<GroupResource> => {
    const res = await axiosInstance.post<ApiResponse<{ resource: GroupResource }>>(
      `/chat/conversations/${conversationId}/resources/${resourceId}/pin`
    );
    return res.data.data!.resource;
  },
};
