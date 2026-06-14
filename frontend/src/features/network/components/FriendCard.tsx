import { Link } from 'react-router-dom';
import { usePresence } from '../../chat/hooks/usePresence';
import { useConfirm } from '@/hooks/useConfirm';
import type { Friendship } from '../types';

/**
 * FriendCard — Component hiển thị thông tin một người bạn.
 *
 * Hiển thị avatar, tên, trạng thái trực tuyến (online/offline)
 * kèm theo các nút hành động: Nhắn tin và Hủy kết bạn.
 */

interface FriendCardProps {
  friendship: Friendship;
  onUnfriend: (friendId: number) => void;
  onMessage?: (friendId: number) => void;
  isProcessing?: boolean;
}

export default function FriendCard({ friendship, onUnfriend, onMessage, isProcessing = false }: FriendCardProps) {
  const friend = friendship.friend;
  const { isOnline, getLastSeen, formatLastSeen } = usePresence();
  const confirm = useConfirm();

  if (!friend) return null;

  const getAvatarLetter = (name: string) => name ? name.charAt(0).toUpperCase() : '?';
  const friendIsOnline = isOnline(friend.id);
  const statusText = friendIsOnline
    ? 'Đang hoạt động'
    : formatLastSeen(getLastSeen(friend.id, friend.last_seen_at));

  return (
    <div className="flex items-center p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all bg-white group overflow-hidden">
      {/* 1. KHU VỰC AVATAR */}
      <Link to={`/profile/${friend.id}`} className="h-12 w-12 flex-shrink-0 relative hover:opacity-90 block">
        {friend.avatar ? (
          <img
            src={friend.avatar}
            alt={friend.name}
            className="h-full w-full rounded-full object-cover border border-gray-50"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
            {getAvatarLetter(friend.name)}
          </div>
        )}
        {/* Status dot — chỉ hiện xanh khi thực sự online */}
        <div className={`absolute bottom-0 right-0 h-3 w-3 border-2 border-white rounded-full transition-colors ${
          friendIsOnline ? 'bg-green-500' : 'bg-gray-300'
        }`}></div>
      </Link>

      {/* 2. KHU VỰC VĂN BẢN (TÊN & TRẠNG THÁI) */}
      <div className="flex-1 min-w-0 ml-3 transition-all duration-300">
        <Link to={`/profile/${friend.id}`} className="text-sm font-bold text-gray-900 truncate hover:text-indigo-600 hover:underline transition-colors block" title={friend.name}>
          {friend.name}
        </Link>
        <p className="text-xs text-gray-500 truncate">
          {statusText}
        </p>
      </div>

      {/* 3. CÁC NÚT HÀNH ĐỘNG */}
      <div className="flex items-center space-x-1 max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out overflow-hidden">
        <button
          onClick={() => onMessage?.(friend.id)}
          disabled={isProcessing}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
          title="Nhắn tin"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        <button
          onClick={async () => {
            const ok = await confirm({ title: 'Hủy kết bạn', message: 'Bạn có chắc chắn muốn hủy kết bạn với người này?', confirmLabel: 'Hủy kết bạn', variant: 'danger' });
            if (ok) onUnfriend(friend.id);
          }}
          disabled={isProcessing}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Hủy kết bạn"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
