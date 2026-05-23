import axiosInstance from '@/lib/axios';
import type { NetworkUser, FriendRequest, Friendship, NetworkResponse, SuggestedUser } from '../types';
import { FRIEND_REQUEST_ACTION, NETWORK_ENDPOINTS } from '../constants';
import { getImageUrl } from '@/utils/getImageUrl';

/**
 * networkApi - Cung cấp các hàm tương tác với Backend liên quan đến mạng lưới người dùng.
 * Bao gồm: Tìm kiếm, kết bạn, hủy kết bạn, gợi ý kết bạn.
 */
export const networkApi = {
  /**
   * Tìm kiếm người dùng dựa trên từ khóa.
   * Cập nhật tự động URL avatar trước khi trả về.
   * @param query Từ khóa tìm kiếm (tên, email, v.v.)
   * @returns Danh sách người dùng phù hợp kèm trạng thái quan hệ.
   */
  searchUsers: async (query: string): Promise<NetworkResponse<NetworkUser[]>> => {
    const response = await axiosInstance.get<NetworkResponse<NetworkUser[]>>(NETWORK_ENDPOINTS.SEARCH_USERS, {
      params: { keyword: query },
    });

    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(user => {
        if (user.avatar) user.avatar = getImageUrl(user.avatar);
      });
    }
    return data;
  },

  /**
   * Lấy thông tin chi tiết của một người dùng bất kỳ.
   * @param userId ID của người dùng cần xem thông tin.
   * @returns Dữ liệu người dùng (NetworkUser).
   */
  getUser: async (userId: number): Promise<NetworkResponse<NetworkUser>> => {
    const response = await axiosInstance.get<NetworkResponse<NetworkUser>>(NETWORK_ENDPOINTS.GET_USER(userId));
    const data = response.data;
    if (data.data?.avatar) {
      data.data.avatar = getImageUrl(data.data.avatar);
    }
    return data;
  },

  /**
   * Lấy danh sách các lời mời kết bạn ĐANG ĐẾN (người khác gửi cho mình).
   * @returns Danh sách lời mời (FriendRequest).
   */
  getFriendRequests: async (): Promise<NetworkResponse<FriendRequest[]>> => {
    const response = await axiosInstance.get<NetworkResponse<FriendRequest[]>>(NETWORK_ENDPOINTS.GET_REQUESTS);

    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(request => {
        if (request.sender?.avatar) request.sender.avatar = getImageUrl(request.sender.avatar);
        if (request.receiver?.avatar) request.receiver.avatar = getImageUrl(request.receiver.avatar);
      });
    }
    return data;
  },

  /**
   * Lấy danh sách bạn bè hiện tại của người dùng.
   * @returns Danh sách bạn bè (Friendship).
   */
  getFriends: async (): Promise<NetworkResponse<Friendship[]>> => {
    const response = await axiosInstance.get<NetworkResponse<Friendship[]>>(NETWORK_ENDPOINTS.GET_FRIENDS);

    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(friendship => {
        if (friendship.friend?.avatar) friendship.friend.avatar = getImageUrl(friendship.friend.avatar);
      });
    }
    return data;
  },

  /**
   * Gợi ý kết bạn dựa trên thuật toán Mutual Friends (Bạn chung).
   * Được sắp xếp theo số lượng bạn chung giảm dần.
   * @returns Danh sách người dùng được gợi ý.
   */
  getSuggestions: async (): Promise<NetworkResponse<SuggestedUser[]>> => {
    const response = await axiosInstance.get<NetworkResponse<SuggestedUser[]>>(NETWORK_ENDPOINTS.GET_SUGGESTIONS);

    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(user => {
        if (user.avatar) user.avatar = getImageUrl(user.avatar);
      });
    }
    return data;
  },

  /**
   * Gửi lời mời kết bạn đến một người dùng khác.
   * @param userId ID của người nhận lời mời.
   * @returns Lời mời vừa được tạo (FriendRequest).
   */
  sendFriendRequest: async (userId: number): Promise<NetworkResponse<FriendRequest>> => {
    const response = await axiosInstance.post<NetworkResponse<FriendRequest>>(NETWORK_ENDPOINTS.SEND_REQUEST, {
      receiver_id: userId,
    });

    const data = response.data;
    if (data.data) {
      if (data.data.sender?.avatar) data.data.sender.avatar = getImageUrl(data.data.sender.avatar);
      if (data.data.receiver?.avatar) data.data.receiver.avatar = getImageUrl(data.data.receiver.avatar);
    }
    return data;
  },

  /**
   * Hủy lời mời kết bạn đã gửi đi.
   * @param userId ID của người đã nhận lời mời.
   */
  cancelFriendRequest: async (userId: number): Promise<NetworkResponse<unknown>> => {
    const response = await axiosInstance.delete<NetworkResponse<unknown>>(NETWORK_ENDPOINTS.CANCEL_REQUEST(userId));
    return response.data;
  },

  /**
   * Phản hồi lại một lời mời kết bạn (Chấp nhận hoặc Từ chối).
   * @param requestId ID của lời mời kết bạn (FriendRequest ID).
   * @param action Hành động: 'accept' (Đồng ý) hoặc 'reject' (Từ chối).
   */
  respondToRequest: async (requestId: number, action: typeof FRIEND_REQUEST_ACTION[keyof typeof FRIEND_REQUEST_ACTION]): Promise<NetworkResponse<unknown>> => {
     
    const response = await axiosInstance.post<NetworkResponse<unknown>>(NETWORK_ENDPOINTS.RESPOND_REQUEST(requestId), {
      action,
    });
    return response.data;
  },

  /**
   * Hủy kết bạn (Xóa bạn bè).
   * Lệnh này sẽ xóa mối quan hệ 2 chiều giữa 2 người dùng.
   * @param userId ID của người bạn muốn xóa.
   */
  unfriend: async (userId: number): Promise<NetworkResponse<unknown>> => {
     
    const response = await axiosInstance.delete<NetworkResponse<unknown>>(NETWORK_ENDPOINTS.UNFRIEND(userId));
    return response.data;
  },
};

