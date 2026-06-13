import type { Conversation } from '../types';
import type { User } from '../../auth/types';
import { BsFire } from 'react-icons/bs';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUser: User;
  isOnline: boolean;
  onClick: () => void;
}

function formatConvTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

/**
 * ConversationItem — Một dòng hiển thị trong danh sách cuộc trò chuyện.
 *
 * Với chat 1-1: Hiển thị avatar của người kia kèm chấm trạng thái online.
 * Với nhóm: Hiển thị avatar nhóm (hoặc chữ cái đầu) kèm theo huy hiệu số lượng.
 */
export default function ConversationItem({
  conversation,
  isActive,
  currentUser,
  isOnline,
  onClick,
}: ConversationItemProps) {
  // Đối với chat 1-1, lấy thông tin người tham gia KHÁC
  const otherUser = !conversation.is_group
    ? conversation.participants.find((p) => p.id !== currentUser.id)
    : null;

  const displayName = conversation.is_group
    ? (conversation.name ?? 'Nhóm không tên')
    : (otherUser?.name ?? 'Người dùng');

  const avatarUrl = conversation.is_group
    ? conversation.avatar
    : otherUser?.avatar;

  const avatarLetter = displayName.charAt(0).toUpperCase();

  let lastMsgContent = 'Chưa có tin nhắn';
  if (conversation.last_message) {
    const msg = conversation.last_message;
    const prefix = msg.sender_id === currentUser.id ? 'Bạn: ' : '';
    
    if (msg.is_recalled) {
      lastMsgContent = `${prefix}Tin nhắn đã thu hồi`;
    } else if (msg.type === 'system') {
      // Bỏ phần dữ liệu thừa sau dải phân cách ||| (tương tự như SystemMessage.tsx)
      const systemText = msg.content.split('|||')[0];
      lastMsgContent = `[Thông báo] ${systemText}`;
    } else if (msg.type === 'image') {
      lastMsgContent = `${prefix}[Hình ảnh]`;
    } else if (msg.type === 'file') {
      try {
        const fileData = JSON.parse(msg.content);
        lastMsgContent = `${prefix}[Tài liệu] ${fileData.name || 'File đính kèm'}`;
      } catch {
        lastMsgContent = `${prefix}[Tài liệu]`;
      }
    } else {
      lastMsgContent = `${prefix}${msg.content}`;
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left border-l-4 ${isActive
          ? 'border-indigo-500 bg-indigo-50/60'
          : 'border-transparent'
        }`}
    >
      {/* Hình đại diện */}
      <div className="relative shrink-0 mr-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-11 w-11 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-base border ${conversation.is_group
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
          >
            {conversation.is_group ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ) : (
              avatarLetter
            )}
          </div>
        )}

        {/* Chấm trạng thái online — chỉ dành cho chat 1-1 */}
        {!conversation.is_group && isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>

      {/* Nội dung chữ */}
      <div className="grow min-w-0">
        <div className="flex justify-between items-baseline">
          <span
            className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-gray-900'
              }`}
          >
            {displayName}
          </span>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {/* Chỉ báo Chuỗi ngày (Streak) */}
            {!conversation.is_group && conversation.streak && conversation.streak.current_streak >= 3 && (
              <span
                className={`flex items-center gap-0.5 text-[10px] font-extrabold rounded-full px-2 py-0.5 border shadow-sm ${
                  conversation.streak.status === 'pending_restore'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : conversation.streak.today_completed
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
                title={`Chuỗi ${conversation.streak.current_streak} ngày`}
              >
                <BsFire className={`w-3 h-3 ${
                  conversation.streak.status === 'pending_restore'
                    ? 'text-slate-400'
                    : conversation.streak.today_completed
                      ? 'text-orange-500'
                      : 'text-gray-400'
                }`} />
                <span>{conversation.streak.current_streak}</span>
              </span>
            )}
            <span className="text-[10px] text-gray-400">
              {formatConvTime(conversation.last_message?.created_at ?? conversation.updated_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p
            className={`text-xs truncate ${(conversation.unread_count ?? 0) > 0
                ? 'text-gray-900 font-medium'
                : 'text-gray-500'
              }`}
          >
            {lastMsgContent}
          </p>
          {(conversation.unread_count ?? 0) > 0 && conversation.my_status === 'pending' ? (
            <span className="ml-2 shrink-0 h-2.5 w-2.5 rounded-full bg-red-500" />
          ) : (conversation.unread_count ?? 0) > 0 ? (
            <span className="ml-2 shrink-0 h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
              {conversation.unread_count! > 9 ? '9+' : conversation.unread_count}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
