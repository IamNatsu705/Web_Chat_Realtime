import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../api/networkApi';
import { useAuth } from '@/providers/AuthProvider';

export const NETWORK_QUERIES = {
  friends: () => ['friends'],
  friendRequests: () => ['friendRequests'],
  suggestions: () => ['friendSuggestions'],
};

export function useFriendsQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: NETWORK_QUERIES.friends(),
    queryFn: async () => {
      const res = await networkApi.getFriends();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    // Danh sách bạn bè ít thay đổi — stale window 2 phút
    staleTime: 120_000,
  });
}

export function useFriendRequestsQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: NETWORK_QUERIES.friendRequests(),
    queryFn: async () => {
      const res = await networkApi.getFriendRequests();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    // Lời mời kết bạn thay đổi thỉnh thoảng — stale window 1 phút
    staleTime: 60_000,
  });
}

export function useSuggestionsQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: NETWORK_QUERIES.suggestions(),
    queryFn: async () => {
      const res = await networkApi.getSuggestions();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    // Gợi ý kết bạn tính từ bạn chung — stale window 5 phút
    staleTime: 300_000,
  });
}
