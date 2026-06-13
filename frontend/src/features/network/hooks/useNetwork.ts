import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../../chat/api/chatApi';
import { networkApi } from '../api/networkApi';
import type { NetworkUser, SuggestedUser } from '../types';
import type { Conversation } from '../../chat/types';
import { RELATIONSHIP_STATUS, FRIEND_REQUEST_ACTION, NETWORK_UI_CONSTANTS } from '../constants';
import { useDebounce } from '../../../hooks/useDebounce';
import { useFriendsQuery, useFriendRequestsQuery, NETWORK_QUERIES } from './queries';
import { CHAT_QUERIES } from '../../chat/hooks/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useNetwork() {
  const queryClient = useQueryClient();

  // Dữ liệu từ React Query (Tự động cache & quản lý loading state)
  const { data: friends = [], isLoading: isFriendsLoading } = useFriendsQuery();
  const { data: requests = [], isLoading: isRequestsLoading } = useFriendRequestsQuery();

  // Giữ lại Local State cho tính năng Tìm kiếm (Vì search thay đổi liên tục, không nên đưa vào Global Cache)
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, NETWORK_UI_CONSTANTS.DEBOUNCE_DELAY_MS);
  const [searchResults, setSearchResults] = useState<NetworkUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [processingUserIds, setProcessingUserIds] = useState<number[]>([]);

  // ── Tính năng Tìm Kiếm (Search Engine) ──────────────────────────────────────────────────
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await networkApi.searchUsers(debouncedSearchQuery);
        setSearchResults(res.data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearchQuery]);

  // Hàm Helper: Đánh dấu đang xử lý 1 user
  const trackProcessing = (userId: number, isAdding: boolean) => {
    setProcessingUserIds(prev => isAdding ? [...prev, userId] : prev.filter(id => id !== userId));
  };

  // ── Mutations: Tự động cập nhật giao diện TRƯỚC khi gọi API (Optimistic UI) ─────────────

  // 1. Thêm Bạn / Gửi Lời Mời
  const addFriendMutation = useMutation({
    mutationFn: (userId: number) => networkApi.sendFriendRequest(userId),
    onMutate: async (userId) => {
      trackProcessing(userId, true);
      // Cập nhật giao diện ngầm thành "Đã gửi" trong lúc chờ máy chủ
      setSearchResults(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, relationship_status: RELATIONSHIP_STATUS.PENDING, is_sender: true } 
          : u
      ));
      queryClient.setQueryData<SuggestedUser[]>(NETWORK_QUERIES.suggestions(), (old) => {
        if (!old) return old;
        return old.map(u => 
          u.id === userId 
            ? { ...u, relationship_status: RELATIONSHIP_STATUS.PENDING, is_sender: true } 
            : u
        );
      });
    },
    onSuccess: (res, userId) => {
      // Có dữ liệu chuẩn từ backend, cập nhật lại ID lời mời để dùng hàm hủy nếu cần
      setSearchResults(prev => prev.map(u => 
        u.id === userId ? { ...u, friend_request_id: res.data?.id } : u
      ));
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friendRequests() });
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.suggestions() });
    },
    onSettled: (_, __, userId) => trackProcessing(userId, false)
  });

  // 2. Hủy Lời Mời Đã Gửi (Đổi ý)
  const cancelRequestMutation = useMutation({
    mutationFn: (userId: number) => networkApi.cancelFriendRequest(userId),
    onMutate: (userId) => {
      trackProcessing(userId, true);
      setSearchResults(prev => prev.map(u => 
        u.id === userId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
      ));
      queryClient.setQueryData<SuggestedUser[]>(NETWORK_QUERIES.suggestions(), (old) => {
        if (!old) return old;
        return old.map(u => 
          u.id === userId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friendRequests() });
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.suggestions() });
    },
    onSettled: (_, __, userId) => trackProcessing(userId, false)
  });

  // 3. Chấp Nhận Yêu Cầu Kết Bạn
  const acceptRequestMutation = useMutation({
    mutationFn: ({ requestId }: { requestId: number, userId?: number }) => 
      networkApi.respondToRequest(requestId, FRIEND_REQUEST_ACTION.ACCEPT),
    onMutate: ({ requestId, userId }) => {
      if (userId) trackProcessing(userId, true);
      
      // Xóa nháp lời mời trên giao diện
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(NETWORK_QUERIES.friendRequests(), (old: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        old ? old.filter((r: any) => r.id !== requestId) : []
      );
      
      // Cập nhật kết quả search thành "Đã kết bạn"
      setSearchResults(prev => prev.map(u => 
        u.friend_request_id === requestId ? { ...u, relationship_status: RELATIONSHIP_STATUS.ACCEPTED } : u
      ));
      queryClient.setQueryData<SuggestedUser[]>(NETWORK_QUERIES.suggestions(), (old) => {
        if (!old) return old;
        return old.filter(u => u.friend_request_id !== requestId);
      });
    },
    onSuccess: () => {
      // Kết bạn xong thì phải tải lại list Friends mới nhất
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friends() });
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.suggestions() });
    },
    onSettled: (_, __, { userId }) => {
      if (userId) trackProcessing(userId, false);
    }
  });

  // 4. Từ Chối Yêu Cầu Kết Bạn
  const rejectRequestMutation = useMutation({
    mutationFn: ({ requestId }: { requestId: number, userId?: number }) => 
      networkApi.respondToRequest(requestId, FRIEND_REQUEST_ACTION.REJECT),
    onMutate: ({ requestId, userId }) => {
      if (userId) trackProcessing(userId, true);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(NETWORK_QUERIES.friendRequests(), (old: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        old ? old.filter((r: any) => r.id !== requestId) : []
      );
      
      setSearchResults(prev => prev.map(u => 
        u.friend_request_id === requestId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
      ));
      queryClient.setQueryData<SuggestedUser[]>(NETWORK_QUERIES.suggestions(), (old) => {
        if (!old) return old;
        return old.map(u => 
          u.friend_request_id === requestId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
        );
      });
    },
    onSettled: (_, __, { userId }) => {
      if (userId) trackProcessing(userId, false);
    }
  });

  // 5. Hủy Kết Bạn (Đoạn tuyệt)
  const unfriendMutation = useMutation({
    mutationFn: (friendId: number) => networkApi.unfriend(friendId),
    onMutate: (friendId) => {
      trackProcessing(friendId, true);
      
      // Gỡ khỏi list Bạn Bè (Optimistic UI)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(NETWORK_QUERIES.friends(), (old: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        old ? old.filter((f: any) => f.friend?.id !== friendId) : []
      );
      
      setSearchResults(prev => prev.map(u => 
        u.id === friendId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
      ));
    },
    onError: () => {
      // Lỗi mạng thả lại dữ liệu cũ
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friends() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.suggestions() });
    },
    onSettled: (_, __, friendId) => trackProcessing(friendId, false)
  });

  const navigate = useNavigate();

  // 6. Nhắn tin với 1 người dùng (Chuyển sang Chat)
  const handleMessageUser = async (userId: number) => {
    trackProcessing(userId, true);
    try {
      const res = await chatApi.getOrCreateDirect(userId);
      if (res.data?.conversation) {
        const newConv = res.data.conversation;
        // Thêm conversation vào cache ngay lập tức (Optimistic UI)
        queryClient.setQueryData<Conversation[]>(CHAT_QUERIES.conversations(), (oldData) => {
          if (!oldData) return [newConv];
          if (oldData.some((c) => c.id === newConv.id)) return oldData;
          return [newConv, ...oldData];
        });
        // Ép fetch lại để đảm bảo dữ liệu đồng bộ với server
        queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
        navigate(`/messages?conversationId=${newConv.id}`);
      }
    } catch (error) {
      console.error('Failed to create or get conversation', error);
      alert('Không thể bắt đầu cuộc trò chuyện. Người này có thể đã chặn bạn.');
    } finally {
      trackProcessing(userId, false);
    }
  };

  // Bọc vào hàm truyền thống để Components (NetworkPage, Card) không tốn công phải chỉnh sửa Props
  const handleAddFriend = (id: number) => addFriendMutation.mutate(id);
  const handleCancelRequest = (id: number) => cancelRequestMutation.mutate(id);
  const handleAcceptRequest = (reqId: number, uId?: number) => acceptRequestMutation.mutate({ requestId: reqId, userId: uId });
  const handleRejectRequest = (reqId: number, uId?: number) => rejectRequestMutation.mutate({ requestId: reqId, userId: uId });
  const handleUnfriend = (fId: number) => unfriendMutation.mutate(fId);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    processingUserIds,
    requests,
    isRequestsLoading,
    friends,
    isFriendsLoading,
    handleAddFriend,
    handleCancelRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleUnfriend,
    handleMessageUser,
  };
}
