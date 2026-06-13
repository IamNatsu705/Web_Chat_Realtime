import type { User } from '../../auth/types';

// ─── Tin nhắn ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// ─── Kiểu dữ liệu Cộng đồng / Nhóm ─────────────────────────────────────────

export type JoinType = 'invite' | 'open' | 'request';
export type GroupRole = 'owner' | 'moderator' | 'member';
export type CommunityCategory = 'subject' | 'department' | 'project' | 'research' | 'club' | 'other';

export interface Message {
  id: number | string; // string cho optimistic (temp_id)
  conversation_id: number;
  sender_id: number | null;
  content: string;
  type: MessageType;
  status: MessageStatus;
  created_at: string;
  sender?: User;
  is_optimistic?: boolean; // true khi chưa được server xác nhận
  is_recalled?: boolean;
  deleted_by?: number[];
  read_at?: string;
  updated_at?: string;
}

// ─── Chuỗi nhắn tin (Streak) ──────────────────────────────────────────────────

export interface StreakData {
  current_streak: number;
  status: 'active' | 'pending_restore' | 'lost';
  restore_days: number;
  tier: string;
  is_milestone?: boolean;
  today_completed?: boolean; // Cả 2 user đã nhắn hôm nay chưa (streak đã tăng)
  // Trường mở rộng (trả về bởi API GET /streaks/{id} chi tiết)
  last_completed_date?: string | null;
  user_messaged_today?: boolean;
  partner_messaged_today?: boolean;
  next_milestone?: number | null;
  days_to_next_milestone?: number;
}

// ─── Cuộc trò chuyện ──────────────────────────────────────────────────────────

export interface ConversationParticipant {
  id: number;
  user_id: number;
  conversation_id: number;
  status: 'active' | 'pending' | 'rejected';
  role?: GroupRole;
  user?: User;
}

export interface Conversation {
  id: number;
  name: string | null;
  description?: string | null;
  is_group: boolean;
  avatar?: string | null;
  admin_id?: number | null;
  join_type?: JoinType;
  category?: CommunityCategory | null;
  member_count?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participants: any[];
  my_status?: 'active' | 'pending' | 'rejected';
  my_role?: GroupRole | null;
  my_join_request_status?: 'pending' | 'approved' | 'rejected' | null;
  last_message?: Message | null;
  unread_count?: number;
  streak?: StreakData | null;
  created_at: string;
  updated_at: string;
}

// ─── Phân trang ───────────────────────────────────────────────────────────────

export interface MessagePage {
  messages: Message[];
  has_more: boolean;
  next_cursor: string | null;
}

// ─── Wrapper phản hồi API ─────────────────────────────────────────────────────

import type { ApiResponse } from '@/types/api';

/**
 * ChatResponse = ApiResponse. Giữ alias cho rõ ràng trong context chat.
 */
export type ChatResponse<T> = ApiResponse<T>;

// ─── Payload sự kiện WebSocket ────────────────────────────────────────────────

export interface WsPresenceOnline {
  user_id: number;
}

export interface WsPresenceOffline {
  user_id: number;
  last_seen: string; // Chuỗi ISO timestamp
}

export interface WsMessageNew {
  message: Message;
  conversation_id: number;
}

export interface WsMessageDelivered {
  message_id: number | string;
  conversation_id: number;
}

export interface WsMessageRead {
  conversation_id: number;
  reader_id: number;
  reader?: User;
}

export interface WsMessageRecalled {
  message_id: number;
  conversation_id: number;
}

export type GroupEventType =
  | 'group_created'
  | 'member_added'
  | 'member_removed'
  | 'member_left'
  | 'group_renamed'
  | 'group_dissolved'
  | 'group_avatar_changed'
  | 'member_promoted'
  | 'member_demoted';

export interface WsGroupEvent {
  type: GroupEventType;
  conversationId: number;
  actor: User;
  target?: User | null;
  newName?: string | null;
}

// ─── Trạng thái hoạt động (Presence) ──────────────────────────────────────────

export interface PresenceEntry {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}

// ─── Quản lý nhóm ─────────────────────────────────────────────────────────────

export interface CreateGroupRequest {
  name: string;
  description?: string;
  join_type?: JoinType;
  category?: CommunityCategory;
  member_ids?: number[];
  avatar?: File | null;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  join_type?: JoinType;
  avatar?: File | null;
}

// ─── Group Resources (Tài liệu nhóm) ─────────────────────────────────────────

export interface GroupResource {
  id: number;
  conversation_id: number;
  title: string;
  description?: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  file_size_human: string;
  category: string;
  download_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  uploader?: User;
}

// ─── Yêu cầu tham gia ────────────────────────────────────────────────────────

export interface GroupJoinRequest {
  id: number;
  conversation_id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  user?: User;
  created_at: string;
}
