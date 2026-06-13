import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import { useAuth } from '@/providers/AuthProvider';
import type { MessagePage } from '../types';
import { sortConversations } from '../utils/chatUtils';

/**
 * Bộ Query Keys trung tâm cho module Chat.
 * Giúp định danh duy nhất các bộ Cache của TanStack Query, phục vụ việc Invalidate hoặc Update cache.
 */
export const CHAT_QUERIES = {
  conversations: () => ['conversations'],
  messages: (conversationId: number) => ['messages', conversationId],
};

/**
 * Hook `useConversationsQuery` - Lấy danh sách các cuộc trò chuyện.
 *
 * **Chiến lược Cache (Stale Time = 30s):**
 * Trong 30 giây kể từ lần fetch gần nhất, nếu Component re-mount, dữ liệu sẽ được lấy ngay từ Cache
 * thay vì gọi API. Sau 30s, dữ liệu bị coi là "Cũ" (Stale) và sẽ ngầm gọi API fetch lại dưới nền.
 * Dữ liệu mới nhất thực chất được cập nhật qua WebSocket, nên 30s là mức an toàn để tránh Spam API.
 */
export function useConversationsQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: CHAT_QUERIES.conversations(),
    queryFn: async () => {
      const res = await chatApi.getConversations();
      const conversations = res.data.conversations ?? [];
      // Sắp xếp các cuộc trò chuyện sao cho cuộc trò chuyện có tin nhắn mới nhất lên đầu
      return sortConversations(conversations);
    },
    enabled: isAuthenticated,
    staleTime: 30_000, 
  });
}

/**
 * Hook `useMessagesQuery` - Quản lý bộ đệm tin nhắn với cơ chế cuộn trang vô hạn (Infinite Scrolling).
 *
 * **Cơ chế Phân trang:**
 * - API trả về dạng Cursor (Mới -> Cũ). Lần đầu lấy 20 tin nhắn mới nhất.
 * - Gọi `fetchNextPage()` sẽ gửi `next_cursor` lên API để lấy 20 tin nhắn cũ hơn.
 * - Dữ liệu được quản lý tự động bởi TanStack Query.
 *
 * @param conversationId ID của cuộc trò chuyện (null nếu chưa chọn ai).
 */
export function useMessagesQuery(conversationId: number | null) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery<MessagePage>({
    queryKey: CHAT_QUERIES.messages(conversationId!),
    queryFn: async ({ pageParam }) => {
      const res = await chatApi.getMessages(conversationId!, pageParam as string | null);
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: isAuthenticated && conversationId !== null,
    staleTime: 60_000, // Tin nhắn được cập nhật qua WS, API chỉ là dự phòng
  });
}
