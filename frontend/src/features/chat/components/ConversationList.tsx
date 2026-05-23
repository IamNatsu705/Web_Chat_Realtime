import { useState } from 'react';
import type { Conversation } from '../types';
import type { User } from '../../auth/types';
import ConversationItem from './ConversationItem';
import { usePresence } from '../hooks/usePresence';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  currentUser: User;
  isLoading: boolean;
  onSelect: (conv: Conversation) => void;
  onNewGroup: () => void;
}

/**
 * Component `ConversationList` — Thanh Sidebar bên trái hiển thị danh sách các cuộc trò chuyện.
 *
 * **Tính năng chính:**
 * - Hiển thị danh sách chat 1-1 và Group Chat.
 * - Có khả năng tìm kiếm (Lọc cục bộ theo Tên nhóm hoặc Tên người dùng).
 * - Tách biệt Tab "Hộp thư chính" (bạn bè/nhóm) và Tab "Người lạ" (tin nhắn chờ).
 * - Sử dụng `usePresence` để hiển thị dấu chấm xanh (Online) real-time.
 * 
 * @param props Các thuộc tính truyền vào (conversations, activeId, currentUser...).
 */
export default function ConversationList({
  conversations,
  activeId,
  currentUser,
  isLoading,
  onSelect,
  onNewGroup,
}: ConversationListProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'active' | 'stranger'>('active');
  const { isOnline } = usePresence();

  const filtered = conversations.filter((c) => {
    const status = c.my_status || 'active';
    
    if (tab === 'active' && status !== 'active') return false;
    if (tab === 'stranger' && status === 'active') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (c.is_group) {
      return (c.name ?? '').toLowerCase().includes(q);
    }
    const other = c.participants.find((p) => p.id !== currentUser.id);
    return (other?.name ?? '').toLowerCase().includes(q);
  });

  const getOtherUserId = (conv: Conversation) => {
    if (conv.is_group) return null;
    return conv.participants.find((p) => p.id !== currentUser.id)?.id ?? null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Tin nhắn</h2>
          <button
            onClick={onNewGroup}
            title="Tạo nhóm mới"
            className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex w-full mt-3 border-b border-gray-200">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'active' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Hộp thư chính
          </button>
          <button
            onClick={() => setTab('stranger')}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'stranger' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Người lạ
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-grow space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-4 text-center">
            {search ? (
              <>
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Không tìm thấy kết quả
              </>
            ) : (
              <>
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chưa có cuộc trò chuyện nào
              </>
            )}
          </div>
        ) : (
          filtered.map((conv) => {
            const otherId = getOtherUserId(conv);
            return (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                currentUser={currentUser}
                isOnline={otherId ? isOnline(otherId) : false}
                onClick={() => onSelect(conv)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
