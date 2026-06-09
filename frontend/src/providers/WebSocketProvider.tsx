import React, { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEcho } from '@/lib/echo';
import { useAuth } from '@/providers/AuthProvider';
import { CHAT_QUERIES, useConversationsQuery } from '@/features/chat/hooks/queries';
import {
  addMessageToCache,
  updateMessagesInCache,
  updateConversationInCache,
} from '@/features/chat/utils/cacheUtils';
import type { Message, Conversation } from '@/features/chat/types';
import toast from 'react-hot-toast';


interface GroupUpdatedPayload {
  type:
    | 'group_created'
    | 'member_added'
    | 'member_removed'
    | 'member_left'
    | 'group_renamed'
    | 'group_avatar_changed'
    | 'group_dissolved';
  conversationId: number;
  actor: { id: number; name: string };
  target?: { id: number; name: string } | null;
  newName?: string | null;
}

/**
 * `WebSocketProvider` — Trái tim xử lý Real-time (Thời gian thực) của ứng dụng Chat.
 *
 * Nhiệm vụ chính của Provider này là lắng nghe (Subscribe) các sự kiện (Events) được phát 
 * từ Laravel Reverb qua giao thức WebSockets, và ngay lập tức phản ánh sự thay đổi đó 
 * lên giao diện người dùng thông qua việc can thiệp vào bộ nhớ đệm Cache (TanStack Query).
 *
 * **Các nhóm Event đang xử lý:**
 * 1. Global Group Events (`.GroupUpdated`): Nhóm được tạo mới, cập nhật, xóa, đổi tên.
 * 2. Cuộc trò chuyện (`chat.{id}`): `MessageSent`, `MessageRead`, `MessageRecalled`, `StreakUpdated`.
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Lấy danh sách conversations từ cache (đã được fetch bởi các component khác)
  const { data: conversations = [] } = useConversationsQuery();

  // Stabilize conversation IDs để tránh re-run effect liên tục
  const conversationIds = useMemo(() => {
    const ids = conversations.map((c) => c.id).sort((a, b) => a - b);
    return ids.join(',');
  }, [conversations]);

  /**
   * ── 1. Lắng nghe `.GroupUpdated` trên kênh `user.{id}` (Kênh cá nhân của từng User) ────────────────
   * Lý do: Sự kiện cập nhật thông tin tổng quát của nhóm ảnh hưởng đến Sidebar (Danh sách trò chuyện),
   * do đó cần lắng nghe chung thay vì lắng nghe trong từng phòng chat.
   */
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let echo: ReturnType<typeof getEcho>;
    try {
      echo = getEcho();
    } catch {
      return;
    }

    const channel = echo.private(`user.${user.id}`);

    const handleGroupUpdated = (payload: GroupUpdatedPayload) => {
      const { type, conversationId } = payload;

      switch (type) {
        case 'group_dissolved': {
          // Xóa conversation khỏi sidebar
          queryClient.setQueryData<Conversation[]>(
            CHAT_QUERIES.conversations(),
            (old = []) => old.filter((c) => c.id !== conversationId)
          );
          // BUG-C1 FIX: Xóa messages cache để tránh memory leak và stale data
          queryClient.removeQueries({ queryKey: CHAT_QUERIES.messages(conversationId) });
          toast(`Nhóm đã bị giải tán bởi ${payload.actor.name}`, { icon: '🗑️' });
          window.dispatchEvent(new CustomEvent('group-action', {
            detail: { type: 'dissolved', conversationId, actorName: payload.actor.name }
          }));
          break;
        }

        case 'member_removed': {
          if (payload.target?.id === user.id) {
            // User bị kick → xóa conversation khỏi sidebar
            queryClient.setQueryData<Conversation[]>(
              CHAT_QUERIES.conversations(),
              (old = []) => old.filter((c) => c.id !== conversationId)
            );
            // Xóa hoàn toàn cache tin nhắn (messages cache) của cuộc trò chuyện này.
            // Điều này cực kỳ quan trọng để ngăn chặn lỗi hiển thị dữ liệu "bóng ma" (stale data) 
            // trong trường hợp user bị kích (kick) và sau đó được mời lại vào chính nhóm này.
            queryClient.removeQueries({ queryKey: CHAT_QUERIES.messages(conversationId) });
            // BUG-15 FIX: Toast thông báo bị kick
            toast(`Bạn đã bị ${payload.actor.name} xóa khỏi nhóm`, { icon: '⚠️' });
            // BUG-15 FIX: Dispatch event cho ChatPage
            window.dispatchEvent(new CustomEvent('group-action', {
              detail: { type: 'kicked', conversationId, actorName: payload.actor.name }
            }));
          } else {
            // Người khác bị kick → refetch để cập nhật danh sách members
            queryClient.invalidateQueries({
              queryKey: CHAT_QUERIES.conversations(),
            });
          }
          break;
        }

        case 'member_left': {
          if (payload.actor.id === user.id) {
            // Chính mình rời → xóa conversation khỏi cache
            queryClient.setQueryData<Conversation[]>(
              CHAT_QUERIES.conversations(),
              (old = []) => old.filter((c) => c.id !== conversationId)
            );
            // BUG-C2 FIX: Xóa messages cache để tránh memory leak
            queryClient.removeQueries({ queryKey: CHAT_QUERIES.messages(conversationId) });
          } else {
            // Người khác rời → refetch để cập nhật members
            queryClient.invalidateQueries({
              queryKey: CHAT_QUERIES.conversations(),
            });
          }
          break;
        }

        case 'group_renamed': {
          // BUG-C4 FIX: invalidate thay vì chỉ setQueryData để đảm bảo đồng bộ
          // với system message có thể đến trước/sau event này
          queryClient.invalidateQueries({
            queryKey: CHAT_QUERIES.conversations(),
          });
          break;
        }

        case 'group_created': {
          queryClient.invalidateQueries({
            queryKey: CHAT_QUERIES.conversations(),
          });
          // Thông báo cho members được mời
          if (payload.actor.id !== user.id) {
            toast.success(`${payload.actor.name} đã thêm bạn vào nhóm mới`);
          }
          break;
        }

        case 'member_added': {
          queryClient.invalidateQueries({
            queryKey: CHAT_QUERIES.conversations(),
          });
          // Thông báo cho member mới được thêm
          if (payload.target?.id === user.id) {
            // Khi một user mới được thêm vào, có thể trước đây họ đã từng ở trong nhóm (bị kick rồi mời lại).
            // Dọn dẹp cache cũ để bắt buộc component ChatRoom fetch lại luồng tin nhắn mới tính từ thời điểm `cleared_at`.
            queryClient.removeQueries({
              queryKey: CHAT_QUERIES.messages(conversationId),
            });
            toast.success(`${payload.actor.name} đã thêm bạn vào nhóm`);
          }
          break;
        }

        case 'group_avatar_changed':
        default: {
          queryClient.invalidateQueries({
            queryKey: CHAT_QUERIES.conversations(),
          });
          break;
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGlobalMessageSent = (payload: any) => {
      const incoming: Message = payload.message;
      if (incoming.sender_id === user.id) return;

      const convId = incoming.conversation_id;
      const conversations = queryClient.getQueryData<Conversation[]>(CHAT_QUERIES.conversations()) || [];
      const exists = conversations.some(c => c.id === convId);

      // Khi nhận được tin nhắn toàn cục (Global Message), nếu conversation_id chưa tồn tại 
      // trong sidebar cache (có thể do đây là nhóm mới hoặc đã bị xóa lịch sử / ẩn trước đó),
      // thực hiện Invalidate Query để fetch lại danh sách trò chuyện và hiển thị nó lên giao diện.
      if (!exists) {
        queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
      }
    };

    channel.listen('.GroupUpdated', handleGroupUpdated);
    channel.listen('.MessageSent', handleGlobalMessageSent);

    return () => {
      channel.stopListening('.GroupUpdated', handleGroupUpdated);
      channel.stopListening('.MessageSent', handleGlobalMessageSent);
    };
  }, [user, user?.id, isAuthenticated, queryClient]);

  /**
   * ── 2. Lắng nghe các sự kiện trong Phòng Chat cụ thể (`chat.{id}`) ──────
   * Dynamically subscribe vào tất cả các kênh `chat.{id}` mà người dùng đang tham gia.
   * Mỗi khi có tin nhắn mới, cập nhật danh sách tin nhắn hiện tại và sidebar (unread count).
   */
  useEffect(() => {
    if (!isAuthenticated || !user || !conversationIds) return;

    let echo: ReturnType<typeof getEcho>;
    try {
      echo = getEcho();
    } catch {
      return;
    }

    const currentIds = conversationIds.split(',').filter(Boolean).map(Number);
    const channels: ReturnType<typeof echo.private>[] = [];

    currentIds.forEach((convId) => {
      const channel = echo.private(`chat.${convId}`);
      channels.push(channel);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMessageSent = (payload: any) => {
        const incoming: Message = payload.message;

        // Bỏ qua tin nhắn của chính mình (đã xử lý bằng Optimistic UI)
        if (incoming.sender_id === user.id) return;

        // 1. Thêm vào danh sách tin nhắn (nếu đang mở)
        addMessageToCache(queryClient, convId, {
          ...incoming,
          status: 'delivered' as const,
        });

        // 2. Cập nhật sidebar (last_message, unread_count)
        // Lưu ý: Unread Count luôn +1. Component mở chat sẽ tự gọi API markRead và set lại 0.
        // System messages (sender_id = null) cũng cập nhật sidebar
        updateConversationInCache(queryClient, convId, (c) => ({
          ...c,
          last_message: incoming,
          updated_at: incoming.created_at,
          unread_count: incoming.type === 'system'
            // Cơ chế xử lý Unread Count (Số tin chưa đọc):
            // Bỏ qua tin nhắn hệ thống (System Messages như thêm/xoá thành viên) không làm tăng bộ đếm.
            // Component mở khung chat (`ChatRoom`) sẽ chịu trách nhiệm gọi API `markAsRead` và đưa số đếm về 0.
            ? (c.unread_count ?? 0)
            : (c.unread_count ?? 0) + 1,
        }));
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMessageRead = (payload: any) => {
        if (payload.userId === user.id) return;

        // Cập nhật trạng thái 'read' cho tin nhắn của user gửi đi
        updateMessagesInCache(queryClient, convId, (msg) =>
          msg.sender_id === user.id &&
          (msg.status === 'sent' || msg.status === 'delivered')
            ? { ...msg, status: 'read' as const }
            : msg
        );
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMessageRecalled = (payload: any) => {
        // Cập nhật content trong danh sách tin nhắn
        updateMessagesInCache(queryClient, convId, (msg) =>
          msg.id === payload.messageId
            ? { ...msg, is_recalled: true, content: 'Tin nhắn đã bị thu hồi' }
            : msg
        );

        // BUG FIX: Invalidate resources in case a file message was recalled
        queryClient.invalidateQueries({ queryKey: ['resources', convId] });

        // BUG-14 FIX: Cập nhật sidebar CHỈ KHI tin nhắn bị recall là last_message
        updateConversationInCache(queryClient, convId, (c: Conversation): Conversation => {
          if (!c.last_message || c.last_message.id !== payload.messageId) return c;

          return {
            ...c,
            last_message: {
              ...c.last_message,
              is_recalled: true,
              content: 'Tin nhắn đã bị thu hồi',
            }
          };
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleStreakUpdated = (payload: any) => {
        const { streak } = payload;
        if (!streak) return;

        // Kỹ thuật Optimistic UI Updates cho Streak:
        // Cập nhật trực tiếp dữ liệu Streak mới nhất vào Cache của Sidebar (Danh sách trò chuyện)
        // để phản hồi giao diện tức thời mà không cần gọi thêm API lấy lại toàn bộ danh sách.
        updateConversationInCache(queryClient, convId, (c) => ({
          ...c,
          streak: streak.current_streak >= 3 ? {
            current_streak: streak.current_streak,
            status: streak.status,
            restore_days: streak.restore_days,
            tier: streak.tier ?? 'streak_5',
            today_completed: streak.today_completed ?? false,
          } : null,
        }));

        // Giao tiếp liên Component qua Custom DOM Events (Event-Driven Architecture):
        // Phát sự kiện toàn cục để StreakInfoPanel (nếu đang được render trên DOM) lắng nghe
        // và tự động trigger hàm lấy dữ liệu chi tiết (enriched data) từ API.
        window.dispatchEvent(new CustomEvent('streak-updated', {
          detail: { conversationId: convId, streak },
        }));
      };

      channel.listen('.MessageSent', handleMessageSent);
      channel.listen('.MessageRead', handleMessageRead);
      channel.listen('.MessageRecalled', handleMessageRecalled);
      channel.listen('.StreakUpdated', handleStreakUpdated);
    });

    return () => {
      // BUG-10 FIX (Memory Leak & 403 Forbidden Prevention):
      // Khi component unmount hoặc conversationIds thay đổi, BẮT BUỘC phải gỡ bỏ các Event Listeners
      // (.stopListening) để giải phóng bộ nhớ. Nếu không, Echo sẽ cố gắng kết nối lại hoặc 
      // nhận sự kiện từ các kênh (channels) mà user không còn quyền truy cập, gây lỗi 403 Authentication.
      channels.forEach((channel) => {
        channel.stopListening('.MessageSent');
        channel.stopListening('.MessageRead');
        channel.stopListening('.MessageRecalled');
        channel.stopListening('.StreakUpdated');
      });
    };
  }, [user, user?.id, isAuthenticated, conversationIds, queryClient]);

  return <>{children}</>;
}
