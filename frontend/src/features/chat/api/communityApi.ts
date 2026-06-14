import axiosInstance from '@/lib/axios';
import { getImageUrl } from '@/utils/getImageUrl';
import type { ChatResponse, Conversation, GroupResource, GroupJoinRequest } from '../types';

/**
 * communityApi — API cho tính năng cộng đồng.
 * Bao gồm: khám phá nhóm, tham gia, quản lý yêu cầu, tài liệu, phó nhóm.
 */

// Chuẩn hóa avatar URL
function normalizeCommunity(conv: Conversation): Conversation {
  if (conv.avatar) conv.avatar = getImageUrl(conv.avatar);
  if (conv.participants) {
    conv.participants.forEach((p: { avatar?: string | null }) => {
      if (p.avatar) p.avatar = getImageUrl(p.avatar);
    });
  }
  return conv;
}

export const communityApi = {
  // ── Khám phá nhóm cộng đồng ──────────────────────────────────────────

  getCommunities: async (search?: string, category?: string, page = 1): Promise<{
    communities: Conversation[];
    pagination: { current_page: number; last_page: number; total: number };
  }> => {
    const params: Record<string, string | number> = { page };
    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;

    const res = await axiosInstance.get<ChatResponse<{
      communities: Conversation[];
      pagination: { current_page: number; last_page: number; total: number };
    }>>('/chat/communities', { params });

    res.data.data?.communities?.forEach(normalizeCommunity);
    return res.data.data!;
  },

  // ── Tham gia nhóm ────────────────────────────────────────────────────

  joinGroup: async (groupId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(`/chat/groups/${groupId}/join`);
    return res.data;
  },

  cancelJoinRequest: async (groupId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.delete<ChatResponse<null>>(`/chat/groups/${groupId}/join`);
    return res.data;
  },

  // ── Yêu cầu tham gia ────────────────────────────────────────────────

  getJoinRequests: async (groupId: number): Promise<GroupJoinRequest[]> => {
    const res = await axiosInstance.get<ChatResponse<{ requests: GroupJoinRequest[] }>>(
      `/chat/groups/${groupId}/join-requests`
    );
    return res.data.data?.requests ?? [];
  },

  respondToJoinRequest: async (
    groupId: number,
    requestId: number,
    action: 'approve' | 'reject'
  ): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(
      `/chat/groups/${groupId}/join-requests/${requestId}/respond`,
      { action }
    );
    return res.data;
  },

  // ── Phó nhóm ─────────────────────────────────────────────────────────

  promoteModerator: async (groupId: number, userId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(
      `/chat/groups/${groupId}/moderators/${userId}`
    );
    return res.data;
  },

  demoteModerator: async (groupId: number, userId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.delete<ChatResponse<null>>(
      `/chat/groups/${groupId}/moderators/${userId}`
    );
    return res.data;
  },

  // ── Tài liệu nhóm ───────────────────────────────────────────────────

  getResources: async (
    groupId: number,
    params?: { search?: string; category?: string; page?: number }
  ): Promise<{
    resources: GroupResource[];
    pagination: { current_page: number; last_page: number; total: number };
  }> => {
    const res = await axiosInstance.get<ChatResponse<{
      resources: GroupResource[];
      pagination: { current_page: number; last_page: number; total: number };
    }>>(`/chat/groups/${groupId}/resources`, { params });

    return res.data.data!;
  },

  uploadResource: async (
    groupId: number,
    data: { title: string; description?: string; category?: string; file: File },
    onProgress?: (percent: number) => void
  ): Promise<GroupResource> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    formData.append('file', data.file);

    const res = await axiosInstance.post<ChatResponse<{ resource: GroupResource }>>(
      `/chat/groups/${groupId}/resources`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Theo dõi tiến trình upload để tránh user bấm nhiều lần
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

  // Sử dụng blob download qua axios (kèm Authorization header)
  // thay vì trả URL string cho window.open (bị 401 Unauthorized)
  downloadResource: async (groupId: number, resourceId: number, fileName?: string): Promise<void> => {
    const res = await axiosInstance.get(
      `/chat/groups/${groupId}/resources/${resourceId}/download`,
      { responseType: 'blob' }
    );

    // Tạo link download tạm từ blob
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteResource: async (groupId: number, resourceId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.delete<ChatResponse<null>>(
      `/chat/groups/${groupId}/resources/${resourceId}`
    );
    return res.data;
  },

  togglePin: async (groupId: number, resourceId: number): Promise<GroupResource> => {
    const res = await axiosInstance.post<ChatResponse<{ resource: GroupResource }>>(
      `/chat/groups/${groupId}/resources/${resourceId}/pin`
    );
    return res.data.data!.resource;
  },
};
