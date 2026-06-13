import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { getEcho } from '../../lib/echo';
import { useQueryClient } from '@tanstack/react-query';
import { useFriendRequestsQuery, NETWORK_QUERIES } from '../../features/network/hooks/queries';
import { useConversationsQuery } from '../../features/chat/hooks/queries';

/**
 * Header — Thanh điều hướng chính của ứng dụng.
 *
 * Hiển thị logo, các mục điều hướng (Trang chủ, Cộng đồng, Tin nhắn, Mạng lưới),
 * badge thông báo (tin nhắn chưa đọc, lời mời kết bạn), và thông tin người dùng.
 * Lắng nghe WebSocket để cập nhật badge real-time.
 */
export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Badge: Lời mời kết bạn ──────────────────────────────────────────────
  const { data: requests = [] } = useFriendRequestsQuery();
  const requestCount = requests.length;

  // ── Badge: Tin nhắn chưa đọc ─────────────────────────────────────
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
      ? "text-[#D70038] inline-flex items-center h-full px-2 border-b-[3px] border-[#D70038] text-[15px] font-bold transition-colors"
      : "text-[#6B7280] hover:text-[#111827] inline-flex items-center h-full px-2 border-b-[3px] border-transparent hover:border-gray-200 text-[15px] font-medium transition-colors";
  };

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 relative">
          
          {/* Trái: Logo */}
          <div className="w-1/4 flex justify-start shrink-0">
            <Link to="/" className="flex items-center gap-2 text-[20px] md:text-[22px] font-extrabold text-[#D70038] tracking-tight hover:opacity-80 transition-opacity">
              PTIT Social
            </Link>
          </div>

          {/* Giữa: Menu điều hướng */}
          <nav className="hidden md:flex h-full items-center justify-center space-x-8 flex-1">
            <Link to="/" className={navLinkClass("/")}>Trang chủ</Link>
            <Link to="/communities" className={navLinkClass("/communities")}>Cộng đồng</Link>
            <Link to="/messages" className={`${navLinkClass("/messages")} relative`}>
              Tin nhắn
              {unreadConversationCount > 0 && (
                <span className="absolute top-3.5 -right-3 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#D70038] rounded-full shadow-sm shadow-red-500/20">
                  {unreadConversationCount > 99 ? '99+' : unreadConversationCount}
                </span>
              )}
            </Link>
            <Link to="/network" className={`${navLinkClass("/network")} relative`}>
              Mạng lưới
              {requestCount > 0 && (
                <span className="absolute top-3.5 -right-3 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#D70038] rounded-full shadow-sm shadow-red-500/20">
                  {requestCount > 99 ? '99+' : requestCount}
                </span>
              )}
            </Link>

            {/* Liên kết quản trị */}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`${navLinkClass("/admin")} !text-purple-600 !border-purple-600`}>
                Admin
              </Link>
            )}
          </nav>

          {/* Phải: Hồ sơ người dùng */}
          <div className="w-1/4 flex justify-end items-center shrink-0">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className={`text-[15px] font-semibold transition-colors hidden lg:block ${isActive('/profile')
                    ? 'text-[#D70038]'
                    : 'text-[#111827] hover:text-[#D70038]'
                    }`}
                >
                  {user.name}
                </Link>
                <div className="h-9 w-9 rounded-full bg-[#FFF1F2] flex items-center justify-center text-[#D70038] font-bold border border-red-100 overflow-hidden shadow-sm">
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
                  className="hidden md:flex ml-2 px-3 py-1.5 border border-[#E2E8F0] bg-white text-[13px] font-semibold rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D70038] focus:ring-offset-1"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-[#6B7280] hover:text-[#111827] px-3 py-2 text-[15px] font-semibold transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-[#D70038] text-white hover:bg-[#BE123C] shadow-sm hover:shadow-md hover:shadow-red-500/20 px-5 py-2 rounded-xl text-[15px] font-semibold transition-all">
                  Đăng ký
                </Link>
              </div>
            )}
            
            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 shadow-inner">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-red-50 text-[#D70038]' : 'text-gray-900 hover:bg-gray-50'}`}>Trang chủ</Link>
            <Link to="/communities" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/communities') ? 'bg-red-50 text-[#D70038]' : 'text-gray-900 hover:bg-gray-50'}`}>Cộng đồng</Link>
            <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/messages') ? 'bg-red-50 text-[#D70038]' : 'text-gray-900 hover:bg-gray-50'}`}>
              Tin nhắn
              {unreadConversationCount > 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#D70038] text-white">{unreadConversationCount > 99 ? '99+' : unreadConversationCount}</span>}
            </Link>
            <Link to="/network" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/network') ? 'bg-red-50 text-[#D70038]' : 'text-gray-900 hover:bg-gray-50'}`}>
              Mạng lưới
              {requestCount > 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#D70038] text-white">{requestCount > 99 ? '99+' : requestCount}</span>}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin') ? 'bg-purple-50 text-purple-600' : 'text-purple-600 hover:bg-purple-50'}`}>Admin</Link>
            )}
            {user && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 mt-4 border-t border-gray-100"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
