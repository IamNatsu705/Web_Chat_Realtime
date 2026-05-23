import axiosInstance from '@/lib/axios';
import { getImageUrl } from '@/utils/getImageUrl';
import type {
  ChatResponse,
  Conversation,
  Message,
  MessagePage,
  CreateGroupRequest,
  UpdateGroupRequest,
} from '../types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function normalizeMessage(msg: Message): Message {
  if (msg.sender?.avatar) msg.sender.avatar = getImageUrl(msg.sender.avatar);
  return msg;
}

function normalizeConversation(conv: Conversation): Conversation {
  if (conv.avatar) conv.avatar = getImageUrl(conv.avatar);
  if (conv.participants) {
    conv.participants.forEach((p) => {
      if (p.avatar) p.avatar = getImageUrl(p.avatar);
    });
  }
  if (conv.last_message) normalizeMessage(conv.last_message);
  return conv;
}

// ─── Chat API ─────────────────────────────────────────────────────────────────

/**
 * chatApi - Cung cấp các hàm tương tác Backend cho tính năng Nhắn tin và Nhóm.
 * Xử lý việc chuẩn hóa dữ liệu hình ảnh (avatar, media) thông qua `normalizeConversation` và `normalizeMessage`.
 */
export const chatApi = {
  /**
   * Lấy danh sách tất cả các cuộc trò chuyện của người dùng hiện tại.
   * @returns Danh sách các cuộc trò chuyện (Conversations).
   */
  getConversations: async (): Promise<ChatResponse<{ conversations: Conversation[] }>> => {
    const res = await axiosInstance.get<ChatResponse<{ conversations: Conversation[] }>>(
      '/chat/conversations'
    );
    res.data.data?.conversations?.forEach(normalizeConversation);
    return res.data;
  },

  /**
   * Get-or-create a direct (1-1) conversation with a friend
   */
  getOrCreateDirect: async (
    friendId: number
  ): Promise<ChatResponse<{ conversation: Conversation }>> => {
    const res = await axiosInstance.post<ChatResponse<{ conversation: Conversation }>>(
      '/chat/conversations/direct',
      { friend_id: friendId }
    );
    if (res.data.data?.conversation) normalizeConversation(res.data.data.conversation);
    return res.data;
  },

  /**
   * Get messages with cursor-based pagination (20 per page)
   */
  getMessages: async (
    conversationId: number,
    cursor?: string | null
  ): Promise<ChatResponse<MessagePage>> => {
    const params: Record<string, string | number> = { limit: 20 };
    if (cursor) params.cursor = cursor;

    const res = await axiosInstance.get<ChatResponse<MessagePage>>(
      `/chat/conversations/${conversationId}/messages`,
      { params }
    );
    res.data.data?.messages?.forEach(normalizeMessage);
    return res.data;
  },

  /**
   * Send a message to a conversation
   */
  sendMessage: async (
    conversationId: number,
    content: string,
    type: 'text' | 'image' = 'text'
  ): Promise<ChatResponse<{ message: Message }>> => {
    const res = await axiosInstance.post<ChatResponse<{ message: Message }>>(
      `/chat/conversations/${conversationId}/messages`,
      { content, type }
    );
    if (res.data.data?.message) normalizeMessage(res.data.data.message);
    return res.data;
  },

  /**
   * Send an image message to a conversation
   */
  sendImageMessage: async (
    conversationId: number,
    file: File
  ): Promise<ChatResponse<{ message: Message }>> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'image');

    const res = await axiosInstance.post<ChatResponse<{ message: Message }>>(
      `/chat/conversations/${conversationId}/messages`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (res.data.data?.message) normalizeMessage(res.data.data.message);
    return res.data;
  },

  /**
   * Mark all messages in a conversation as read
   */
  markRead: async (conversationId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(
      `/chat/conversations/${conversationId}/read`
    );
    return res.data;
  },

  // ─── Endpoints quản lý Nhóm (Group) ──────────────────────────────────────────

  /**
   * Tạo một nhóm trò chuyện mới.
   * @param data Dữ liệu tạo nhóm (Tên, ID các thành viên, Avatar tùy chọn).
   * @returns Thông tin cuộc trò chuyện nhóm vừa được tạo.
   */
  createGroup: async (
    data: CreateGroupRequest
  ): Promise<ChatResponse<{ conversation: Conversation }>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    data.member_ids.forEach((id) => formData.append('member_ids[]', String(id)));
    if (data.avatar instanceof File) formData.append('avatar', data.avatar);

    const res = await axiosInstance.post<ChatResponse<{ conversation: Conversation }>>(
      '/chat/groups',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (res.data.data?.conversation) normalizeConversation(res.data.data.conversation);
    return res.data;
  },

  /**
   * Cập nhật thông tin nhóm (Tên nhóm, Avatar).
   * Yêu cầu gửi kèm phương thức PUT dạng _method spoofing qua FormData.
   * @param groupId ID của nhóm.
   * @param data Thông tin cần cập nhật.
   */
  updateGroup: async (
    groupId: number,
    data: UpdateGroupRequest
  ): Promise<ChatResponse<{ conversation: Conversation }>> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.avatar instanceof File) formData.append('avatar', data.avatar);
    formData.append('_method', 'PUT');

    const res = await axiosInstance.post<ChatResponse<{ conversation: Conversation }>>(
      `/chat/groups/${groupId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (res.data.data?.conversation) normalizeConversation(res.data.data.conversation);
    return res.data;
  },

  /**
   * Add a member to a group (admin only)
   */
  addGroupMember: async (
    groupId: number,
    userId: number
  ): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(
      `/chat/groups/${groupId}/members`,
      { user_id: userId }
    );
    return res.data;
  },

  /**
   * Remove (kick) a member from a group (admin only)
   */
  removeGroupMember: async (
    groupId: number,
    userId: number
  ): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.delete<ChatResponse<null>>(
      `/chat/groups/${groupId}/members/${userId}`
    );
    return res.data;
  },

  /**
   * Leave a group (current user)
   */
  leaveGroup: async (groupId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(`/chat/groups/${groupId}/leave`);
    return res.data;
  },

  /**
   * Dissolve / delete a group (admin only)
   */
  dissolveGroup: async (groupId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.delete<ChatResponse<null>>(`/chat/groups/${groupId}`);
    return res.data;
  },

  // ─── Quản lý Tin nhắn và Cuộc gọi lạ (Stranger) ───────────────────────────

  /**
   * Thu hồi tin nhắn (Người gửi tự thu hồi).
   * @param messageId ID tin nhắn cần thu hồi.
   */
  recallMessage: async (messageId: number): Promise<ChatResponse<{ message: Message }>> => {
    const res = await axiosInstance.post<ChatResponse<{ message: Message }>>(
      `/chat/messages/${messageId}/recall`
    );
    if (res.data.data?.message) normalizeMessage(res.data.data.message);
    return res.data;
  },

  /**
   * Xóa tin nhắn chỉ ở phía người dùng hiện tại (Xóa ở phía tôi).
   * @param messageId ID tin nhắn cần xóa.
   */
  deleteMessageForMe: async (messageId: number): Promise<ChatResponse<{ message: Message }>> => {
    const res = await axiosInstance.delete<ChatResponse<{ message: Message }>>(
      `/chat/messages/${messageId}/delete`
    );
    if (res.data.data?.message) normalizeMessage(res.data.data.message);
    return res.data;
  },

  /**
   * Xóa toàn bộ lịch sử tin nhắn của một cuộc trò chuyện.
   * @param conversationId ID cuộc trò chuyện.
   */
  clearConversation: async (conversationId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.delete<ChatResponse<null>>(
      `/chat/conversations/${conversationId}/clear`
    );
    return res.data;
  },

  /**
   * Chấp nhận tin nhắn chờ từ người lạ (Stranger).
   */
  acceptStranger: async (conversationId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(
      `/chat/conversations/${conversationId}/accept`
    );
    return res.data;
  },

  /**
   * Từ chối tin nhắn chờ từ người lạ.
   */
  rejectStranger: async (conversationId: number): Promise<ChatResponse<null>> => {
    const res = await axiosInstance.post<ChatResponse<null>>(
      `/chat/conversations/${conversationId}/reject`
    );
    return res.data;
  },

  // ─── Tính năng Chuỗi trò chuyện (Streaks) ───────────────────────────────────

  /**
   * Lấy thông tin chuỗi trò chuyện (Streak) hiện tại của 1-1 chat.
   */
  getStreak: async (conversationId: number): Promise<ChatResponse<{ streak: import('../types').StreakData | null }>> => {
    const res = await axiosInstance.get<ChatResponse<{ streak: import('../types').StreakData | null }>>(
      `/chat/streaks/${conversationId}`
    );
    return res.data;
  },

  /**
   * Sử dụng quyền khôi phục chuỗi (nếu bị lỡ ngày).
   */
  restoreStreak: async (conversationId: number): Promise<ChatResponse<{ current_streak: number; restore_days: number; status: string }>> => {
    const res = await axiosInstance.post<ChatResponse<{ current_streak: number; restore_days: number; status: string }>>(
      `/chat/streaks/${conversationId}/restore`
    );
    return res.data;
  },

  /**
   * Chia sẻ thành tựu chuỗi lên bản tin (Feed).
   */
  shareStreak: async (conversationId: number): Promise<ChatResponse<{ post_id: number; message: string }>> => {
    const res = await axiosInstance.post<ChatResponse<{ post_id: number; message: string }>>(
      `/chat/streaks/${conversationId}/share`
    );
    return res.data;
  },
};
