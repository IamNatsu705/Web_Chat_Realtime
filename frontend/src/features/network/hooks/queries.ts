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
    // Friends list rarely changes — 2 min stale window
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
    // Friend requests change occasionally — 1 min stale window
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
    // Suggestions are computed from mutual friends — 5 min stale window
    staleTime: 300_000,
  });
}
