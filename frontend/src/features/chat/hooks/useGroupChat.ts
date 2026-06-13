import { useState } from 'react';
import { chatApi } from '../api/chatApi';
import type { CreateGroupRequest, UpdateGroupRequest } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CHAT_QUERIES } from './queries';
import toast from 'react-hot-toast';

/**
 * Hook `useGroupChat` — Cung cấp các thao tác (Mutations) để quản lý Nhóm Chat.
 * 
 * **Tích hợp TanStack Query:**
 * Hook này sử dụng `useMutation` để tự động đồng bộ trạng thái Loading (`isProcessing`),
 * và tự động vô hiệu hóa cache (Invalidate Queries) của danh sách hội thoại sau khi thực hiện
 * thành công các hành động (tạo nhóm, thêm thành viên, rời nhóm, v.v.).
 * 
 * *Lưu ý:* Việc lắng nghe sự kiện cập nhật nhóm (WebSockets) không nằm ở đây mà được quản lý 
 * tập trung tại `WebSocketProvider` để tránh dư thừa listener.
 */
export function useGroupChat() {
  const queryClient = useQueryClient();

  // State nội bộ để báo cho UI (Nút bấm, Loading spinner) biết đang xử lý một tác vụ nào đó
  const [isProcessing, setIsProcessing] = useState(false);

  /** Hàm hỗ trợ bật/tắt trạng thái xử lý */
  const trackLoading = (state: boolean) => setIsProcessing(state);

  // ── Mutations Hành động Nhóm ──────────────────────────────────────────────
  // BUG-C6 FIX: Chỉ giữ invalidate cho createGroup (cần data ngay để navigate).
  // Các mutations khác để WebSocket events xử lý cache update, tránh double API calls.

  const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroupRequest) => chatApi.createGroup(data),
    onMutate: () => trackLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
    },
    onSettled: () => trackLoading(false),
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data: UpdateGroupRequest }) => chatApi.updateGroup(groupId, data),
    onMutate: () => trackLoading(true),
    // BUG-D FIX: Fallback invalidate nếu WS bị delay
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
    },
    onSettled: () => trackLoading(false),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) => chatApi.addGroupMember(groupId, userId),
    onMutate: () => trackLoading(true),
    // BUG-D FIX: Invalidate conversations để cập nhật danh sách participants
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
    },
    onSettled: () => trackLoading(false),
  });

  const kickMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) => chatApi.removeGroupMember(groupId, userId),
    onMutate: () => trackLoading(true),
    // BUG-D FIX: Invalidate conversations để cập nhật danh sách participants
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
    },
    onSettled: () => trackLoading(false),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => chatApi.leaveGroup(groupId),
    onMutate: () => trackLoading(true),
    onSettled: () => trackLoading(false),
  });

  const dissolveGroupMutation = useMutation({
    mutationFn: (groupId: number) => chatApi.dissolveGroup(groupId),
    onMutate: () => trackLoading(true),
    onSettled: () => trackLoading(false),
  });

  // ── Wrappers (Đóng gói Mutations thành các hàm dễ gọi hơn) ───────────

  /**
   * Tạo một nhóm chat mới.
   * @param data Dữ liệu tạo nhóm (tên, avatar, danh sách thành viên).
   * @returns Thông tin nhóm vừa tạo hoặc `null` nếu có lỗi.
   */
  const createGroup = async (data: CreateGroupRequest) => {
    try {
      const res = await createGroupMutation.mutateAsync(data);
      toast.success('Tạo nhóm thành công!');
      return res.data.conversation;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tạo nhóm. Vui lòng thử lại.';
      toast.error(message);
      return null;
    }
  };

  /**
   * Cập nhật thông tin của nhóm chat.
   * @param groupId ID của nhóm chat.
   * @param data Tên mới hoặc Avatar mới.
   */
  const updateGroup = async (groupId: number, data: UpdateGroupRequest) => {
    try {
      const res = await updateGroupMutation.mutateAsync({ groupId, data });
      toast.success('Cập nhật nhóm thành công!');
      return res.data.conversation;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể cập nhật nhóm.';
      toast.error(message);
      return null;
    }
  };

  /**
   * Thêm một người dùng vào nhóm (Tất cả thành viên đều có thể thêm bạn bè).
   * @param groupId ID nhóm.
   * @param userId ID người dùng cần thêm.
   */
  const addMember = async (groupId: number, userId: number) => {
    try {
      await addMemberMutation.mutateAsync({ groupId, userId });
      toast.success('Đã thêm thành viên vào nhóm!');
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể thêm thành viên.';
      toast.error(message);
      return false;
    }
  };

  /**
   * Xóa một thành viên khỏi nhóm (Chỉ Admin nhóm).
   * @param groupId ID nhóm.
   * @param userId ID thành viên cần xóa.
   */
  const kickMember = async (groupId: number, userId: number) => {
    try {
      await kickMemberMutation.mutateAsync({ groupId, userId });
      toast.success('Đã xóa thành viên khỏi nhóm!');
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể xóa thành viên.';
      toast.error(message);
      return false;
    }
  };

  /**
   * Tự nguyện rời khỏi nhóm.
   * @param groupId ID nhóm muốn rời.
   */
  const leaveGroup = async (groupId: number) => {
    try {
      await leaveGroupMutation.mutateAsync(groupId);
      toast.success('Đã rời khỏi nhóm!');
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể rời nhóm.';
      toast.error(message);
      return false;
    }
  };

  /**
   * Giải tán nhóm chat vĩnh viễn (Chỉ Admin nhóm).
   * @param groupId ID nhóm.
   */
  const dissolveGroup = async (groupId: number) => {
    try {
      await dissolveGroupMutation.mutateAsync(groupId);
      toast.success('Đã giải tán nhóm!');
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể giải tán nhóm.';
      toast.error(message);
      return false;
    }
  };

  return {
    isProcessing,
    createGroup,
    updateGroup,
    addMember,
    kickMember,
    leaveGroup,
    dissolveGroup,
  };
}
