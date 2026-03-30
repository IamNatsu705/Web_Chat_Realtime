import { useState, useEffect } from 'react';
import { networkApi } from '../api';
import type { NetworkUser, FriendRequest, Friendship } from '../types';
import { RELATIONSHIP_STATUS, FRIEND_REQUEST_ACTION, NETWORK_UI_CONSTANTS } from '../constants';
import { useDebounce } from '../../../hooks/useDebounce';

export function useNetwork() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, NETWORK_UI_CONSTANTS.DEBOUNCE_DELAY_MS);

  const [searchResults, setSearchResults] = useState<NetworkUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [processingUserIds, setProcessingUserIds] = useState<number[]>([]);

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsFriendsLoading(true);
      const res = await networkApi.getFriends();
      setFriends(res.data);
    } catch (error) {
      console.error('Failed to fetch friends', error);
    } finally {
      setIsFriendsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setIsRequestsLoading(true);
      const res = await networkApi.getFriendRequests();
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  // Perform search
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

  // Actions
  const handleAddFriend = async (userId: number) => {
    try {
      setProcessingUserIds(prev => [...prev, userId]);
      const res = await networkApi.sendFriendRequest(userId);
      // Optimistic UI update in search results
      setSearchResults(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, relationship_status: RELATIONSHIP_STATUS.PENDING, is_sender: true, friend_request_id: res.data?.id } 
          : u
      ));
    } catch (error) {
      console.error('Failed to send friend request', error);
    } finally {
      setProcessingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleCancelRequest = async (userId: number) => {
    try {
      setProcessingUserIds(prev => [...prev, userId]);
      await networkApi.cancelFriendRequest(userId);
      setSearchResults(prev => prev.map(u => 
        u.id === userId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
      ));
    } catch (error) {
      console.error('Failed to cancel request', error);
    } finally {
      setProcessingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleAcceptRequest = async (requestId: number, userId?: number) => {
    try {
      if (userId) setProcessingUserIds(prev => [...prev, userId]);
      // Optimistic UI
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setSearchResults(prev => prev.map(u => 
        u.friend_request_id === requestId ? { ...u, relationship_status: RELATIONSHIP_STATUS.ACCEPTED } : u
      ));
      await networkApi.respondToRequest(requestId, FRIEND_REQUEST_ACTION.ACCEPT);
      // Refresh friends list to show new friend
      fetchFriends();
    } catch (error) {
      console.error('Accept request failed', error);
    } finally {
      if (userId) setProcessingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleRejectRequest = async (requestId: number, userId?: number) => {
    try {
      if (userId) setProcessingUserIds(prev => [...prev, userId]);
      // Optimistic UI
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setSearchResults(prev => prev.map(u => 
        u.friend_request_id === requestId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
      ));
      await networkApi.respondToRequest(requestId, FRIEND_REQUEST_ACTION.REJECT);
    } catch (error) {
      console.error('Reject request failed', error);
    } finally {
      if (userId) setProcessingUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleUnfriend = async (friendId: number) => {
    try {
      setProcessingUserIds(prev => [...prev, friendId]);
      
      // Update both friends list and search results optimistically
      setFriends(prev => prev.filter(f => f.friend?.id !== friendId));
      setSearchResults(prev => prev.map(u => 
        u.id === friendId ? { ...u, relationship_status: RELATIONSHIP_STATUS.NONE } : u
      ));
      
      await networkApi.unfriend(friendId);
    } catch (error) {
      console.error('Unfriend failed', error);
      fetchFriends(); // Revert on failure
    } finally {
      setProcessingUserIds(prev => prev.filter(id => id !== friendId));
    }
  };

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
  };
}
