import { QueryClient } from '@tanstack/react-query';
import { CHAT_QUERIES } from '../hooks/queries';
import type { Message, MessagePage, Conversation } from '../types';
import { sortConversations } from './chatUtils';

export interface InfiniteData {
  pages: MessagePage[];
  pageParams: (string | null)[];
}

/**
 * Thêm 1 tin nhắn mới vào cuối page đầu tiên (page mới nhất).
 * Tránh duplicate bằng cách check id.
 */
export function addMessageToCache(queryClient: QueryClient, conversationId: number, message: Message) {

  queryClient.setQueryData(
    CHAT_QUERIES.messages(conversationId),
    (oldData: InfiniteData | undefined) => {
      if (!oldData || oldData.pages.length === 0) {
        return {
          pages: [
            { messages: [message], hasMore: false }
          ],
          pageParams: [null]
        };
      }

      const newPages = [...oldData.pages];
      const firstPage = { ...newPages[0] };

      // Tránh duplicate (socket reconnect, optimistic trùng với server response)
      if (firstPage.messages.some((m: Message) => m.id === message.id)) {
        return oldData;
      }

      // Page đầu tiên chứa tin nhắn mới nhất (Mới→Cũ).
      // Thêm vào ĐẦU mảng (vì mảng đang Mới→Cũ, đầu = mới nhất)
      firstPage.messages = [message, ...firstPage.messages];
      newPages[0] = firstPage;

      return { ...oldData, pages: newPages };
    }
  );

}

/**
 * Thay thế 1 tin nhắn (theo id) trong cache.
 * Dùng cho: optimistic → confirmed, optimistic → failed.
 */
export function replaceMessageInCache(
  queryClient: QueryClient,
  conversationId: number,
  oldId: number | string,
  newMessage: Message
) {
  queryClient.setQueryData(
    CHAT_QUERIES.messages(conversationId),
    (oldData: InfiniteData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m: Message) =>
            m.id === oldId ? newMessage : m
          ),
        })),
      };
    }
  );
}

/**
 * Map qua tất cả tin nhắn trong cache và transform.
 * Dùng cho: mark read, recall updates.
 */
export function updateMessagesInCache(
  queryClient: QueryClient,
  conversationId: number,
  updater: (msg: Message) => Message
) {
  queryClient.setQueryData(
    CHAT_QUERIES.messages(conversationId),
    (oldData: InfiniteData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map(updater),
        })),
      };
    }
  );
}

/**
 * Xóa 1 tin nhắn khỏi cache (deleteForMe).
 */
export function removeMessageFromCache(
  queryClient: QueryClient,
  conversationId: number,
  messageId: number | string
) {
  queryClient.setQueryData(
    CHAT_QUERIES.messages(conversationId),
    (oldData: InfiniteData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.filter((m: Message) => m.id !== messageId),
        })),
      };
    }
  );
}

/**
 * Cập nhật sidebar conversation (last_message, unread_count).
 * Xử lý Race Condition: Kiểm tra created_at để không đè dữ liệu mới bằng dữ liệu cũ.
 */
export function updateConversationInCache(
  queryClient: QueryClient,
  conversationId: number,
  updater: (conv: Conversation) => Conversation
) {
  queryClient.setQueryData<Conversation[]>(
    CHAT_QUERIES.conversations(),
    (oldData = []) => {
      let updated = false;
      const newData = oldData.map((c) => {
        if (c.id !== conversationId) return c;
        updated = true;

        const updatedConv = updater(c);

        // Race Condition Check: So sánh thời gian
        // Guard cho null/undefined timestamps
        const oldTimeStr = c.last_message?.created_at || c.updated_at;
        const newTimeStr = updatedConv.last_message?.created_at || updatedConv.updated_at;
        const oldTime = oldTimeStr ? new Date(oldTimeStr).getTime() : 0;
        const newTime = newTimeStr ? new Date(newTimeStr).getTime() : 0;

        // Nếu tin nhắn đang cập nhật CŨ HƠN tin nhắn hiện tại có trong cache, không ghi đè
        // Skip check nếu 1 trong 2 timestamps không hợp lệ (NaN)
        if (oldTime && newTime && newTime < oldTime) return c;

        return updatedConv;
      });

      // Nếu không tìm thấy trong cache, không làm gì (có thể invalidate query nếu cần)
      if (!updated) return oldData;

      return sortConversations(newData);
    }
  );
}
