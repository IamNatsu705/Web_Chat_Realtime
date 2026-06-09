import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import type { Message, Conversation, } from '../types';
import { useAuth } from '@/providers/AuthProvider';
import { useMessagesQuery } from './queries';
import {
  addMessageToCache,
  replaceMessageInCache,
  updateMessagesInCache,
  removeMessageFromCache,
  updateConversationInCache
} from '../utils/cacheUtils';

interface UseConversationReturn {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  sendImageMessage: (file: File) => Promise<void>;
  sendFileMessage: (file: File, meta?: { title: string; category: string; description: string }, onProgress?: (progress: number) => void) => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: () => Promise<void>;
  handleLocalRecall: (messageId: number | string, recalledMessage: Message) => void;
  handleLocalDelete: (messageId: number | string) => void;
}

let tempIdCounter = 0;
const nextTempId = () => `temp_${++tempIdCounter}`;

/**
 * Hook `useConversation` — Quản lý toàn bộ vòng đời tin nhắn trong một cuộc hội thoại cụ thể.
 *
 * **Các Tính Năng Cốt Lõi:**
 * 1. **Data Fetching (TanStack Query):** Lấy danh sách tin nhắn và tự động phân trang (Cursor Pagination).
 * 2. **Optimistic UI:** Khi người dùng gửi tin nhắn, UI sẽ hiện tin nhắn đó ngay lập tức với trạng thái "Đang gửi" 
 *    để tăng cảm giác mượt mà, sau khi Backend phản hồi sẽ đổi trạng thái thành "Đã gửi" hoặc "Lỗi".
 * 3. **Real-time Sync:** Nhận tin nhắn đến, thu hồi tin nhắn hoặc xóa tin nhắn thông qua Global Cache Utils.
 *
 * @param conversation Đối tượng cuộc trò chuyện hiện tại (hoặc null nếu chưa chọn).
 * @returns Object chứa danh sách tin nhắn, trạng thái loading, và các hàm gửi/xóa/thu hồi.
 */
export function useConversation(
  conversation: Conversation | null
): UseConversationReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const conversationId = conversation?.id ?? null;

  // ── 1. Quản lý luồng tải dữ liệu (Data Fetching) ───────────
  const {
    data,
    isLoading,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
    error: queryError,
  } = useMessagesQuery(conversationId);

  // Trải phẳng (Flatten) các trang tin nhắn từ TanStack Query thành 1 mảng duy nhất.
  // API trả về mảng xếp theo thứ tự Mới -> Cũ. Tuy nhiên UI chat cần Cũ ở trên, Mới ở dưới.
  // Do đó ta cần đảo ngược thứ tự các trang và thứ tự tin nhắn trong mỗi trang.
  const messages = useMemo(() => {
    if (!data?.pages) return [];
    
    const allMessages: Message[] = [];
    // Lặp ngược từ trang cũ nhất (page cuối) về trang mới nhất (page đầu)
    for (let i = data.pages.length - 1; i >= 0; i--) {
      const pageMessages = [...data.pages[i].messages].reverse();
      allMessages.push(...pageMessages);
    }
    return allMessages;
  }, [data]);

  const hasMore = hasNextPage ?? false;
  const error = queryError ? 'Không thể tải tin nhắn. Vui lòng thử lại.' : null;

  // ── 2. Load more (cursor pagination) ────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!conversationId || isLoadingMore || !hasMore) return;
    await fetchNextPage();
  }, [conversationId, isLoadingMore, hasMore, fetchNextPage]);

  // ── 3. Gửi tin nhắn Text (Tích hợp Optimistic UI) ───────────────────────────────
  /**
   * Hàm gửi tin nhắn văn bản.
   * Áp dụng nguyên lý Optimistic Updates: Cập nhật UI ngay lập tức trước khi gọi API.
   * @param content Nội dung chữ của tin nhắn.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim() || !user) return;

      const tempId = nextTempId();
      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        type: 'text',
        status: 'sending',
        created_at: new Date().toISOString(),
        sender: user,
        is_optimistic: true,
      };

      // BƯỚC 1: Chèn optimistic message vào cache TanStack
      addMessageToCache(queryClient, conversationId, optimisticMsg);
      updateConversationInCache(queryClient, conversationId, (c) => ({
        ...c,
        last_message: optimisticMsg,
        updated_at: optimisticMsg.created_at,
      }));

      try {
        // BƯỚC 2: Gọi API lưu vào cơ sở dữ liệu
        const res = await chatApi.sendMessage(conversationId, content.trim());
        const confirmed = res.data.message;

        // BƯỚC 3: Thay thế tin nhắn tạm bằng tin nhắn thật
        replaceMessageInCache(queryClient, conversationId, tempId, {
          ...confirmed,
          status: 'sent' as const,
        });
      } catch {
        // BƯỚC 4: Báo lỗi
        replaceMessageInCache(queryClient, conversationId, tempId, {
          ...optimisticMsg,
          status: 'failed' as const,
        });
      }
    },
    [conversationId, user, queryClient]
  );

  // ── 3b. Gửi tin nhắn Hình ảnh (Optimistic UI với Local Blob Preview) ────────────────────
  /**
   * Hàm gửi tin nhắn hình ảnh.
   * Tạo một Blob URL tạm thời để hiển thị ảnh ngay lập tức mà không cần đợi Upload xong.
   * Blob URL sẽ được giải phóng (revoke) sau khi ảnh upload lên server thành công.
   * @param file File hình ảnh do người dùng chọn.
   */
  const sendImageMessage = useCallback(
    async (file: File) => {
      if (!conversationId || !user) return;

      const tempId = nextTempId();
      const blobUrl = URL.createObjectURL(file);
      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: blobUrl,
        type: 'image',
        status: 'sending',
        created_at: new Date().toISOString(),
        sender: user,
        is_optimistic: true,
      };

      addMessageToCache(queryClient, conversationId, optimisticMsg);
      updateConversationInCache(queryClient, conversationId, (c) => ({
        ...c,
        last_message: optimisticMsg,
        updated_at: optimisticMsg.created_at,
      }));

      try {
        const res = await chatApi.sendImageMessage(conversationId, file);
        const confirmed = res.data.message;

        URL.revokeObjectURL(blobUrl);
        replaceMessageInCache(queryClient, conversationId, tempId, {
          ...confirmed,
          status: 'sent' as const,
        });
      } catch {
        replaceMessageInCache(queryClient, conversationId, tempId, {
          ...optimisticMsg,
          status: 'failed' as const,
        });
      }
    },
    [conversationId, user, queryClient]
  );

  // ── 3c. Gửi tin nhắn File (Optimistic UI) ───────────────────────────────────
  const sendFileMessage = useCallback(
    async (file: File, meta?: { title: string; category: string; description: string }, onProgress?: (progress: number) => void) => {
      if (!conversationId || !user) return;

      const tempId = nextTempId();
      // For file preview, we can just store the filename in content or a JSON string
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: 'other'
      };
      
      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: JSON.stringify(fileInfo),
        type: 'file',
        status: 'sending',
        created_at: new Date().toISOString(),
        sender: user,
        is_optimistic: true,
      };

      addMessageToCache(queryClient, conversationId, optimisticMsg);
      updateConversationInCache(queryClient, conversationId, (c) => ({
        ...c,
        last_message: optimisticMsg,
        updated_at: optimisticMsg.created_at,
      }));

      try {
        const res = await chatApi.sendFileMessage(conversationId, file, meta, onProgress);
        const confirmed = res.data.message;

        replaceMessageInCache(queryClient, conversationId, tempId, {
          ...confirmed,
          status: 'sent' as const,
        });

        // Invalidate resources to update the UI instantly
        queryClient.invalidateQueries({ queryKey: ['resources', conversationId] });
      } catch {
        replaceMessageInCache(queryClient, conversationId, tempId, {
          ...optimisticMsg,
          status: 'failed' as const,
        });
      }
    },
    [conversationId, user, queryClient]
  );

  /**
   * Cập nhật trạng thái "Đã đọc" cho toàn bộ tin nhắn trong cuộc trò chuyện.
   */
  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await chatApi.markRead(conversationId);
    } catch {
      // Bỏ qua lỗi nếu không mark read được vì không nghiêm trọng
    }
  }, [conversationId]);

  // ── 4. WebSocket listeners have been moved to Global Event Bus (WebSocketProvider) ──

  // ── Local handlers (recall, delete) ────────────────────────────────────────
  const handleLocalRecall = useCallback(
    (messageId: number | string, recalledMessage: Message) => {
      if (!conversationId) return;
      updateMessagesInCache(queryClient, conversationId, (msg) =>
        msg.id === messageId ? recalledMessage : msg
      );
      // Invalidate resources in case a file message was recalled
      queryClient.invalidateQueries({ queryKey: ['resources', conversationId] });
    },
    [conversationId, queryClient]
  );

  const handleLocalDelete = useCallback(
    (messageId: number | string) => {
      if (!conversationId) return;
      removeMessageFromCache(queryClient, conversationId, messageId);
    },
    [conversationId, queryClient]
  );

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendMessage,
    sendImageMessage,
    sendFileMessage,
    loadMore,
    markRead,
    handleLocalRecall,
    handleLocalDelete,
  };
}
