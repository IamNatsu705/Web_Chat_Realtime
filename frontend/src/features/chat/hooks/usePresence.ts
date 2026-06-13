import { useState, useEffect, useCallback } from 'react';
import { getEcho } from '@/lib/echo';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Hook `usePresence` theo dõi trạng thái Hoạt động (Online/Offline) của người dùng theo thời gian thực.
 * 
 * **Cơ chế hoạt động:**
 * - Sử dụng Laravel Echo Presence Channel (`presence.online`).
 * - Áp dụng mẫu thiết kế Singleton State: Kênh (channel) chỉ được subscribe 1 lần duy nhất cho toàn ứng dụng.
 *   Điều này giúp tiết kiệm tài nguyên mạng và tránh việc mở nhiều kết nối WebSocket trùng lặp khi hook
 *   được sử dụng ở nhiều component khác nhau.
 * - Quản lý `last_seen_at` (thời gian truy cập cuối) ngay trên phía Client khi người dùng ngắt kết nối.
 *
 * @returns Object chứa các hàm kiểm tra online `isOnline`, lấy `getLastSeen`, format text `formatLastSeen` và danh sách đang online.
 */

// ── Module-level singleton state ──────────────────────────────────────────────
// Dùng singleton để tránh mỗi component tạo subscription riêng.
// Tất cả instances của usePresence() sẽ chung data.
let globalOnlineIds = new Set<number>();
let globalLastSeen = new Map<number, string>(); // userId -> ISO timestamp
let subscriberCount = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let presenceChannel: any = null;
const listeners = new Set<() => void>();

// Track ID của Echo instance tại thời điểm join để detect khi Echo bị reinitialize
let joinedEchoId = 0;
let currentEchoId = 0;

/**
 * Hàm thông báo cho tất cả các component đang subscribe để kích hoạt re-render.
 */
function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Mở kết nối đến Presence Channel.
 * Xử lý các sự kiện `here` (khởi tạo), `joining` (user vào), `leaving` (user ra).
 */
function joinPresenceChannel() {
  // BƯỚC 1: Kiểm tra Echo instance
  let echo: ReturnType<typeof getEcho>;
  try {
    echo = getEcho();
  } catch {
    return; // Dừng nếu Echo chưa được khởi tạo
  }

  // BƯỚC 2: Kiểm soát session qua ID để tránh trùng lặp
  currentEchoId++;
  const thisEchoId = currentEchoId;

  // BƯỚC 3: Dọn dẹp session cũ nếu Echo instance đã thay đổi
  if (presenceChannel && joinedEchoId !== thisEchoId) {
    presenceChannel = null;
    globalOnlineIds = new Set();
  }

  if (presenceChannel) return; // Bỏ qua nếu đã kết nối

  joinedEchoId = thisEchoId;
  presenceChannel = echo
    .join('presence.online')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .here((users: any[]) => {
      if (joinedEchoId !== thisEchoId) return;
      globalOnlineIds = new Set(users.map((u) => u.id));
      users.forEach((u) => {
        if (u.last_seen_at) globalLastSeen.set(u.id, u.last_seen_at);
      });
      notifyListeners();
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .joining((user: any) => {
      if (joinedEchoId !== thisEchoId) return;
      globalOnlineIds = new Set([...globalOnlineIds, user.id]);
      if (user.last_seen_at) globalLastSeen.set(user.id, user.last_seen_at);
      notifyListeners();
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .leaving((user: any) => {
      if (joinedEchoId !== thisEchoId) return;
      const next = new Set(globalOnlineIds);
      next.delete(user.id);
      globalOnlineIds = next;
      // Khi user offline, ghi nhận timestamp hiện tại làm `last_seen`
      globalLastSeen.set(user.id, new Date().toISOString());
      notifyListeners();
    });
}

function leavePresenceChannel() {
  if (!presenceChannel) return;
  try {
    const echo = getEcho();
    echo.leave('presence.online');
  } catch {
    // Bỏ qua — Echo có thể đã bị hủy khi đăng xuất
  }
  presenceChannel = null;
  globalOnlineIds = new Set();
  notifyListeners();
}

/**
 * Reset singleton state. Được gọi khi Echo bị destroy (logout).
 * Đảm bảo lần login tiếp theo sẽ join Presence Channel mới.
 */
export function resetPresence() {
  presenceChannel = null;
  globalOnlineIds = new Set();
  globalLastSeen = new Map();
  notifyListeners();
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePresence() {
  const { isAuthenticated } = useAuth();

  // Local state để trigger re-render khi globalOnlineIds thay đổi
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(globalOnlineIds);
  const [lastSeenMap, setLastSeenMap] = useState<Map<number, string>>(globalLastSeen);

  useEffect(() => {
    if (!isAuthenticated) {
      // User đã đăng xuất → reset state cục bộ
      setOnlineUserIds(new Set());
      setLastSeenMap(new Map());
      return;
    }

    // Subscribe singleton
    subscriberCount++;
    if (subscriberCount === 1) {
      joinPresenceChannel();
    }

    // Đăng ký listener để cập nhật local state
    const listener = () => {
      setOnlineUserIds(new Set(globalOnlineIds));
      setLastSeenMap(new Map(globalLastSeen));
    };
    listeners.add(listener);

    // Sync ngay lập tức (trường hợp đã có data từ subscriber trước)
    setOnlineUserIds(new Set(globalOnlineIds));
    setLastSeenMap(new Map(globalLastSeen));

    return () => {
      listeners.delete(listener);
      subscriberCount--;
      if (subscriberCount === 0) {
        leavePresenceChannel();
      }
    };
  }, [isAuthenticated]);

  /**
   * Kiểm tra xem một người dùng có đang online hay không.
   * Sử dụng `useCallback` để tránh re-render không cần thiết khi tham chiếu hàm thay đổi.
   * @param userId ID người dùng cần kiểm tra.
   * @returns `true` nếu đang online, `false` nếu offline.
   */
  const isOnline = useCallback(
    (userId: number) => onlineUserIds.has(userId),
    [onlineUserIds]
  );

  /**
   * Lấy thời gian hoạt động cuối cùng của người dùng (`last_seen_at`).
   * Ưu tiên dữ liệu Real-time (từ sự kiện `leaving`), sau đó mới dùng dữ liệu từ API.
   * @param userId ID người dùng.
   * @param apiLastSeen Dữ liệu thời gian trả về từ API Backend.
   * @returns Chuỗi ISO của thời gian hoặc `null`.
   */
  const getLastSeen = useCallback(
    (userId: number, apiLastSeen?: string | null): string | null => {
      const wsLastSeen = lastSeenMap.get(userId);
      if (wsLastSeen) return wsLastSeen;
      if (apiLastSeen) return apiLastSeen;
      return null;
    },
    [lastSeenMap]
  );

  /**
   * Định dạng thời gian `last_seen` thành chuỗi văn bản thân thiện với người dùng.
   * (Vd: "Vừa hoạt động", "Hoạt động 5 phút trước").
   * @param lastSeen Chuỗi ISO thời gian.
   * @returns Chuỗi văn bản đã định dạng.
   */
  const formatLastSeen = useCallback((lastSeen?: string | null): string => {
    if (!lastSeen) return 'Ngoại tuyến';
    const diffMs = Date.now() - new Date(lastSeen).getTime();
    const diffMins = Math.floor(diffMs / 60_000);

    if (diffMins < 1) return 'Vừa hoạt động';
    if (diffMins < 60) return `Hoạt động ${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hoạt động ${diffDays} ngày trước`;
  }, []);

  return { isOnline, getLastSeen, formatLastSeen, onlineUserIds };
}
