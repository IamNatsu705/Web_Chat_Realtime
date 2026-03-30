import type { User } from '../../auth/types';
import { RELATIONSHIP_STATUS } from '../constants';

export type RelationshipStatus = typeof RELATIONSHIP_STATUS[keyof typeof RELATIONSHIP_STATUS];

export interface NetworkUser extends User {
  relationship_status: RelationshipStatus;
  friend_request_id?: number;
  is_sender?: boolean; // True if the current user sent the request
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
  user_id: number;
  friend_id: number;
  created_at: string;
  friend?: User;
}

export interface NetworkResponse<T> {
  status: string;
  message: string;
  data: T;
}
