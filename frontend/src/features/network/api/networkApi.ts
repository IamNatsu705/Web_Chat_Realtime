import axiosInstance from '@/lib/axios';
import type { NetworkUser, FriendRequest, Friendship, NetworkResponse } from '../types';
import { FRIEND_REQUEST_ACTION, NETWORK_ENDPOINTS } from '../constants';

export const networkApi = {
  // Search users by name or email
  searchUsers: async (query: string): Promise<NetworkResponse<NetworkUser[]>> => {
    const response = await axiosInstance.get<NetworkResponse<NetworkUser[]>>(NETWORK_ENDPOINTS.SEARCH_USERS, {
      params: { keyword: query },
    });
    return response.data;
  },

  // Get list of pending friend requests (usually incoming)
  getFriendRequests: async (): Promise<NetworkResponse<FriendRequest[]>> => {
    const response = await axiosInstance.get<NetworkResponse<FriendRequest[]>>(NETWORK_ENDPOINTS.GET_REQUESTS);
    return response.data;
  },

  // Get current friends list
  getFriends: async (): Promise<NetworkResponse<Friendship[]>> => {
    const response = await axiosInstance.get<NetworkResponse<Friendship[]>>(NETWORK_ENDPOINTS.GET_FRIENDS);
    return response.data;
  },

  // Send a friend request
  sendFriendRequest: async (userId: number): Promise<NetworkResponse<FriendRequest>> => {
    const response = await axiosInstance.post<NetworkResponse<FriendRequest>>(NETWORK_ENDPOINTS.SEND_REQUEST, {
      receiver_id: userId,
    });
    return response.data;
  },

  // Cancel a friend request we sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cancelFriendRequest: async (userId: number): Promise<NetworkResponse<any>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await axiosInstance.delete<NetworkResponse<any>>(NETWORK_ENDPOINTS.CANCEL_REQUEST(userId));
    return response.data;
  },

  // Respond to a friend request (accept/reject)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respondToRequest: async (requestId: number, action: typeof FRIEND_REQUEST_ACTION[keyof typeof FRIEND_REQUEST_ACTION]): Promise<NetworkResponse<any>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await axiosInstance.post<NetworkResponse<any>>(NETWORK_ENDPOINTS.RESPOND_REQUEST(requestId), {
      action,
    });
    return response.data;
  },

  // Unfriend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unfriend: async (userId: number): Promise<NetworkResponse<any>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await axiosInstance.delete<NetworkResponse<any>>(NETWORK_ENDPOINTS.UNFRIEND(userId));
    return response.data;
  },
};
