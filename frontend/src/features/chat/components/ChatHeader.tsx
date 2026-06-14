import { useState } from 'react';
import type { Conversation } from '../types';
import type { User } from '../../auth/types';
import { usePresence } from '../hooks/usePresence';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '@/hooks/useConfirm';
import StreakInfoPanel from './StreakInfoPanel';
import { BsFire } from 'react-icons/bs';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
  onInfoClick: () => void;
  onResourceClick?: () => void;
  onLeaveGroup?: () => void;
  onDissolveGroup?: () => void;
  onClearChat?: () => void;
}

/**
 * Component `ChatHeader` — Thanh tiêu đề phía trên cùng của giao diện Chat.
 *
 * **Đặc điểm:**
 * - **Chat 1-1:** Hiển thị Avatar cá nhân, Tên, Trạng thái hoạt động (Online / Hoạt động x phút trước), và Nút xem Trang cá nhân.
 * - **Group Chat:** Hiển thị Avatar nhóm, Tên nhóm, Số lượng thành viên, và Nút mở menu quản lý nhóm (Rời nhóm, Giải tán nhóm).
 * - **Tính năng chung:** Hiển thị huy hiệu Chuỗi trò chuyện (Streak badge). Click để mở StreakInfoPanel.
 * 
 * @param props Các thuộc tính truyền vào (conversation, currentUser, các callbacks xử lý hành động).
 */
export default function ChatHeader({
  conversation,
  currentUser,
  onInfoClick,
  onResourceClick,
  onLeaveGroup,
  onDissolveGroup,
  onClearChat,
}: ChatHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streakPanelOpen, setStreakPanelOpen] = useState(false);
  const { isOnline, getLastSeen, formatLastSeen } = usePresence();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const isGroup = conversation.is_group;
  const isAdmin = isGroup && conversation.admin_id === currentUser.id;

  const otherUser = !isGroup
    ? conversation.participants.find((p) => p.id !== currentUser.id)
    : null;

  const displayName = isGroup
    ? (conversation.name ?? 'Nhóm không tên')
    : (otherUser?.name ?? 'Người dùng');

  const avatarUrl = isGroup ? conversation.avatar : otherUser?.avatar;

  const onlineStatus = !isGroup && otherUser
    ? isOnline(otherUser.id)
      ? 'Đang hoạt động'
      : formatLastSeen(getLastSeen(otherUser.id, otherUser.last_seen_at))
    : null;

  const memberCount = conversation.participants.length;

  const hasStreak = !isGroup && conversation.streak && conversation.streak.current_streak >= 3;

  return (
    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">
      {/* Trái: Hình đại diện + Thông tin */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Hình đại diện */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border ${isGroup
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
            >
              {isGroup ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
          )}
          {/* Chấm trạng thái online cho chat 1-1 */}
          {!isGroup && otherUser && isOnline(otherUser.id) && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        {/* Tên & Trạng thái */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-gray-900 truncate leading-tight">{displayName}</h2>
            {/* Huy hiệu chuỗi ngày - Nhấn để mở StreakInfoPanel */}
            {hasStreak && (
              <div className="relative">
                <button
                  onClick={() => setStreakPanelOpen((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-extrabold rounded-full px-3 py-1 shrink-0 cursor-pointer border transition-all duration-300 hover:scale-105 shadow-sm ${
                    conversation.streak!.status === 'pending_restore'
                      ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 shadow-slate-200/50'
                      : conversation.streak!.today_completed
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent hover:brightness-110 hover:shadow-orange-500/20 hover:shadow-md'
                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                  }`}
                  title={`Chuỗi ${conversation.streak!.current_streak} ngày — Nhấn để xem chi tiết`}
                >
                  <BsFire className={`w-3.5 h-3.5 ${
                    conversation.streak!.status === 'pending_restore'
                      ? 'text-slate-400'
                      : conversation.streak!.today_completed
                        ? 'text-yellow-300 animate-pulse'
                        : 'text-gray-400'
                  }`} />
                  <span>{conversation.streak!.current_streak}</span>
                </button>

                {/* Popup StreakInfoPanel */}
                {streakPanelOpen && (
                  <StreakInfoPanel
                    conversationId={conversation.id}
                    streakPreview={conversation.streak!}
                    currentUser={currentUser}
                    otherUser={otherUser}
                    onClose={() => setStreakPanelOpen(false)}
                  />
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-tight">
            {isGroup
              ? `${memberCount} thành viên`
              : onlineStatus}
          </p>
        </div>
      </div>

      {/* Phải: Các nút hành động */}
      <div className="flex items-center space-x-1 shrink-0">
        {/* Đi đến hồ sơ (chỉ chat 1-1) */}
        {!isGroup && otherUser && (
          <button
            onClick={() => navigate(`/profile/${otherUser.id}`)}
            title="Xem trang cá nhân"
            className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        )}

        {/* Tài liệu — dùng cho mọi loại chat */}
        <button
          onClick={onResourceClick ?? onInfoClick}
          title="Tài liệu"
          className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Nút tùy chọn mở rộng */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              {/* Lớp phủ (Backdrop) */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                {isGroup && (
                  <>
                    <button
                      onClick={() => { onInfoClick(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Thông tin nhóm</span>
                    </button>
                    {!isAdmin && (
                      <button
                        onClick={async () => { 
                          setDropdownOpen(false);
                          const ok = await confirm({ title: 'Rời nhóm', message: 'Bạn có chắc chắn muốn rời khỏi nhóm này?', confirmLabel: 'Rời nhóm', variant: 'warning' });
                          if (ok) onLeaveGroup?.();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Rời nhóm</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={async () => { 
                          setDropdownOpen(false);
                          const ok = await confirm({ title: 'Giải tán nhóm', message: 'Bạn có chắc chắn muốn giải tán nhóm này? Hành động này không thể hoàn tác.', confirmLabel: 'Giải tán', variant: 'danger' });
                          if (ok) onDissolveGroup?.();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Giải tán nhóm</span>
                      </button>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                  </>
                )}
                {/* Xóa lịch sử trò chuyện — dùng cho cả 1-1 và nhóm */}
                <button
                  onClick={async () => { 
                    setDropdownOpen(false);
                    const ok = await confirm({ title: 'Xóa lịch sử chat', message: 'Bạn có chắc chắn muốn xóa lịch sử trò chuyện này?', confirmLabel: 'Xóa', variant: 'danger' });
                    if (ok) onClearChat?.();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Xóa lịch sử chat</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
