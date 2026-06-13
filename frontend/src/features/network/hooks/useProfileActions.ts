import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { networkApi } from '../api/networkApi';
import { chatApi } from '../../chat/api/chatApi';
import type { Conversation } from '../../chat/types';
import { FRIEND_REQUEST_ACTION } from '../constants';
import { NETWORK_QUERIES } from './queries';
import { CHAT_QUERIES } from '../../chat/hooks/queries';

/**
 * Hook nhỏ gọn cung cấp các hành động network cho trang Profile.
 * Sử dụng lại networkApi và query invalidation.
 */
export function useProfileActions(userId: number | null) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const invalidateProfile = () => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['userProfile', String(userId)] });
    }
    queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friends() });
    queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friendRequests() });
  };

  const sendRequestMutation = useMutation({
    mutationFn: () => networkApi.sendFriendRequest(userId!),
    onMutate: () => setIsProcessing(true),
    onSuccess: () => invalidateProfile(),
    onSettled: () => setIsProcessing(false),
  });

  const cancelRequestMutation = useMutation({
    mutationFn: () => networkApi.cancelFriendRequest(userId!),
    onMutate: () => setIsProcessing(true),
    onSuccess: () => invalidateProfile(),
    onSettled: () => setIsProcessing(false),
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: number) =>
      networkApi.respondToRequest(requestId, FRIEND_REQUEST_ACTION.ACCEPT),
    onMutate: () => setIsProcessing(true),
    onSuccess: () => invalidateProfile(),
    onSettled: () => setIsProcessing(false),
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: number) =>
      networkApi.respondToRequest(requestId, FRIEND_REQUEST_ACTION.REJECT),
    onMutate: () => setIsProcessing(true),
    onSuccess: () => invalidateProfile(),
    onSettled: () => setIsProcessing(false),
  });

  const unfriendMutation = useMutation({
    mutationFn: () => networkApi.unfriend(userId!),
    onMutate: () => setIsProcessing(true),
    onSuccess: () => invalidateProfile(),
    onSettled: () => setIsProcessing(false),
  });

  const handleMessage = async () => {
    if (!userId) return;
    setIsProcessing(true);
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
        queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
        navigate(`/messages?conversationId=${newConv.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    sendRequest: () => sendRequestMutation.mutate(),
    cancelRequest: () => cancelRequestMutation.mutate(),
    acceptRequest: (requestId: number) => acceptRequestMutation.mutate(requestId),
    rejectRequest: (requestId: number) => rejectRequestMutation.mutate(requestId),
    unfriend: () => unfriendMutation.mutate(),
    handleMessage,
  };
}
