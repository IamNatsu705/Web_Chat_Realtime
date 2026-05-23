import { useEffect, useMemo } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { getEcho } from '../../lib/echo';
import { useQueryClient } from '@tanstack/react-query';
import { useFriendRequestsQuery, NETWORK_QUERIES } from '../../features/network/hooks/queries';
import { useConversationsQuery } from '../../features/chat/hooks/queries';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  // ── Badge: Friend requests ──────────────────────────────────────────────
  const { data: requests = [] } = useFriendRequestsQuery();
  const requestCount = requests.length;

  // ── Badge: Unread messages ─────────────────────────────────────
  const { data: conversations = [] } = useConversationsQuery();
  const unreadConversationCount = useMemo(
    () => conversations.filter(c => (c.unread_count ?? 0) > 0 && c.my_status === 'active').length,
    [conversations]
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // ── Realtime: Lắng nghe sự kiện WebSocket để cập nhật badge ──────────────
  useEffect(() => {
    if (user) {
      const channel = getEcho().private(`user.${user.id}`);

      channel.listen('.FriendRequestReceived', () => {
        queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friendRequests() });
      });

      channel.listen('.FriendRequestUpdated', () => {
        queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friendRequests() });
        queryClient.invalidateQueries({ queryKey: NETWORK_QUERIES.friends() });
      });

      return () => {
        channel.stopListening('.FriendRequestReceived');
        channel.stopListening('.FriendRequestUpdated');
      };
    }
  }, [user, queryClient]);

  const navLinkClass = (path: string) => {
    return isActive(path)
      ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
                Chatify
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={navLinkClass("/")}>
                Home
              </Link>
              <Link to="/messages" className={`${navLinkClass("/messages")} relative`}>
                Tin nhắn
                {unreadConversationCount > 0 && (
                  <span className="absolute top-2 -right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadConversationCount > 99 ? '99+' : unreadConversationCount}
                  </span>
                )}
              </Link>
              <Link to="/network" className={`${navLinkClass("/network")} relative`}>
                Mạng lưới
                {requestCount > 0 && (
                  <span className="absolute top-2 -right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                    {requestCount > 99 ? '99+' : requestCount}
                  </span>
                )}
              </Link>

              {/* Admin link */}
              {user?.role === 'admin' && (
                <Link to="/admin" className={`${navLinkClass("/admin")} text-purple-600`}>
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors hidden md:block ${isActive('/profile')
                    ? 'text-indigo-600 font-bold'
                    : 'text-gray-700 hover:text-indigo-600'
                    }`}
                >
                  {user.name}
                </Link>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold border border-indigo-200 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="ml-4 px-3 py-1.5 border border-transparent text-sm font-medium rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
