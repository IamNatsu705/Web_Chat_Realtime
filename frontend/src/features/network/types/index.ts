import type { User } from '../../auth/types';
import { RELATIONSHIP_STATUS } from '../constants';

export type RelationshipStatus = typeof RELATIONSHIP_STATUS[keyof typeof RELATIONSHIP_STATUS];

export interface NetworkUser extends User {
  relationship_status: RelationshipStatus;
  friend_request_id?: number;
  is_sender?: boolean; // True nếu người dùng hiện tại là người gửi lời mời
}

export interface FriendRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: RelationshipStatus;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Friendship {
  id: number;
  created_at: string;
  friend?: User;
}

import type { ApiResponse } from '@/types/api';

/**
 * NetworkResponse = ApiResponse. Giữ alias cho rõ ràng trong context network.
 */
export type NetworkResponse<T> = ApiResponse<T>;

export interface SuggestedUser extends NetworkUser {
  mutual_friends_count: number;
}
