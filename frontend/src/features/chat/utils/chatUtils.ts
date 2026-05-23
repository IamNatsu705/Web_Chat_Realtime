import type { Conversation } from '../types';

/**
 * Sort conversations theo thời gian tin nhắn mới nhất lên đầu.
 * Dùng chung cho cả queries.ts (khi fetch từ API) và useChatWebSocket.ts (khi nhận WS event).
 * 
 * Tách riêng thành file utils để tránh circular dependency:
 * queries.ts ↔ useChatWebSocket.ts
 */
export function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeA = a.last_message?.created_at || a.updated_at;
    const timeB = b.last_message?.created_at || b.updated_at;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });
}
