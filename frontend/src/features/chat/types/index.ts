import type { User } from '../../auth/types';

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: number | string; // string for optimistic (temp_id)
  conversation_id: number;
  sender_id: number;
  content: string;
  type: MessageType;
  status: MessageStatus;
  created_at: string;
  sender?: User;
  is_optimistic?: boolean; // true when not yet confirmed by server
  is_recalled?: boolean;
  deleted_by?: number[];
  read_at?: string;
  updated_at?: string;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export interface StreakData {
  current_streak: number;
  status: 'active' | 'pending_restore' | 'lost';
  restore_days: number;
  tier: string;
  is_milestone?: boolean;
  today_completed?: boolean; // Whether both users messaged today (streak incremented)
  // Enriched fields (returned by dedicated GET /streaks/{id} API)
  last_completed_date?: string | null;
  user_messaged_today?: boolean;
  partner_messaged_today?: boolean;
  next_milestone?: number | null;
  days_to_next_milestone?: number;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface ConversationParticipant {
  id: number;
  user_id: number;
  conversation_id: number;
  status: 'active' | 'pending' | 'rejected';
  user?: User;
}

export interface Conversation {
  id: number;
  name: string | null;
  is_group: boolean;
  avatar?: string | null;
  admin_id?: number | null;   // For group chats
  participants: User[];
  my_status?: 'active' | 'pending' | 'rejected';
  last_message?: Message | null;
  unread_count?: number;
  streak?: StreakData | null;
  created_at: string;
  updated_at: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface MessagePage {
  messages: Message[];
  has_more: boolean;
  next_cursor: string | null;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

import type { ApiResponse } from '@/types/api';

/**
 * ChatResponse = ApiResponse. Giữ alias cho rõ ràng trong context chat.
 */
export type ChatResponse<T> = ApiResponse<T>;

// ─── WebSocket event payloads ─────────────────────────────────────────────────

export interface WsPresenceOnline {
  user_id: number;
}

export interface WsPresenceOffline {
  user_id: number;
  last_seen: string; // ISO timestamp
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
  | 'group_avatar_changed';

export interface WsGroupEvent {
  type: GroupEventType;
  conversationId: number;  // camelCase — matches BE broadcastWith()
  actor: User;             // who performed the action
  target?: User | null;    // who was affected (added/removed)
  newName?: string | null;  // for group_renamed (camelCase — matches BE)
}

// ─── Presence state ───────────────────────────────────────────────────────────

export interface PresenceEntry {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}

// ─── Group management ─────────────────────────────────────────────────────────

export interface CreateGroupRequest {
  name: string;
  member_ids: number[];
  avatar?: File | null;
}

export interface UpdateGroupRequest {
  name?: string;
  avatar?: File | null;
}
