import { useState, useEffect, useCallback, useRef } from 'react';
import { getEcho } from '@/lib/echo';
import { useAuth } from '@/providers/AuthProvider';

interface TypingUser {
  userId: number;
  name: string;
}

/**
 * useTyping — Hook quản lý trạng thái "đang soạn tin" cho một cuộc hội thoại.
 *
 * Cơ chế:
 * - Sử dụng `echo.private('chat.{id}').whisper('typing', {...})` — client-side only
 * - Không cần backend event/controller, whisper chạy trực tiếp qua Reverb
 * - Debounce 1.5s khi emit để tránh spam
 * - Timeout 2.5s: nếu không nhận thêm whisper → ẩn indicator
 *
 * @param conversationId - ID cuộc hội thoại hiện tại (null nếu chưa chọn)
 * @param isGroup - true nếu là chat nhóm
 */
export function useTyping(conversationId: number | null, isGroup: boolean) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Refs cho timers
  const emitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // ── Emit typing whisper (debounced 1.5s) ────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!conversationId || !user) return;

    // Debounce: nếu đã có timeout pending thì skip
    if (emitTimeoutRef.current) return;

    try {
      const echo = getEcho();
      const channel = echo.private(`chat.${conversationId}`);

      channel.whisper('typing', {
        userId: user.id,
        name: user.name,
      });
    } catch {
      // Echo chưa sẵn sàng
    }

    // Throttle: block emit trong 1.5s tiếp theo
    emitTimeoutRef.current = setTimeout(() => {
      emitTimeoutRef.current = null;
    }, 1500);
  }, [conversationId, user]);

  // ── Listen for typing whispers ──────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !user) return;

    let echo: ReturnType<typeof getEcho>;
    try {
      echo = getEcho();
    } catch {
      return;
    }

    const channel = echo.private(`chat.${conversationId}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTypingWhisper = (data: any) => {
      const incomingUserId = data.userId as number;
      const incomingName = data.name as string;

      // Bỏ qua whisper của chính mình
      if (incomingUserId === user.id) return;

      // Thêm vào danh sách typing users (nếu chưa có)
      setTypingUsers((prev) => {
        const exists = prev.some((u) => u.userId === incomingUserId);
        if (!exists) {
          return [...prev, { userId: incomingUserId, name: incomingName }];
        }
        return prev;
      });

      // Reset timeout cho user này: ẩn sau 2.5s không nhận thêm
      const existingTimeout = typingTimeoutsRef.current.get(incomingUserId);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== incomingUserId));
        typingTimeoutsRef.current.delete(incomingUserId);
      }, 2500);

      typingTimeoutsRef.current.set(incomingUserId, timeout);
    };

    channel.listenForWhisper('typing', handleTypingWhisper);

    return () => {
      channel.stopListeningForWhisper('typing');

      // Clear tất cả timeouts khi unmount / đổi conversation
      typingTimeoutsRef.current.forEach((t) => clearTimeout(t));
      typingTimeoutsRef.current.clear();
      setTypingUsers([]);
    };
  }, [conversationId, user]);

  // Cleanup emit debounce on unmount
  useEffect(() => {
    return () => {
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
        emitTimeoutRef.current = null;
      }
    };
  }, []);

  // ── Tạo display text ───────────────────────────────────────────────────
  const typingText = (() => {
    if (typingUsers.length === 0) return null;

    if (isGroup) {
      // Chat nhóm: hiện chung
      return 'Có người đang soạn tin...';
    }

    // Chat cá nhân: hiện tên
    return `${typingUsers[0].name} đang soạn tin...`;
  })();

  return {
    emitTyping,
    typingUsers,
    typingText,
    isTyping: typingUsers.length > 0,
  };
}
