import { useState, useRef } from 'react';
import type { Conversation, UpdateGroupRequest, GroupRole } from '../types';
import type { User } from '../../auth/types';
import type { Friendship } from '../../network/types';
import AddMembersModal from './AddMembersModal';
import ResourcePanel from './ResourcePanel';
import JoinRequestsTab from './JoinRequestsTab';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { communityApi } from '../api/communityApi';
import { CHAT_QUERIES } from '../hooks/queries';
import { useConfirm } from '@/hooks/useConfirm';

interface GroupInfoPanelProps {
  conversation: Conversation;
  currentUser: User;
  friends: Friendship[];
  isProcessing: boolean;
  onClose: () => void;
  onRenameGroup: (data: UpdateGroupRequest) => void;
  onAddMember: (userId: number) => void;
  onKickMember: (userId: number) => Promise<any> | void;
}

/**
 * GroupInfoPanel — panel thông tin bên phải của giao diện chat.
 *
 * Tabs:
 *  - "Thành viên": danh sách, thêm/kick thành viên, đổi tên/avatar nhóm
 *  - "Tài liệu": ResourcePanel (xem/upload/download/ghim tài liệu)
 *
 * Phân quyền hiển thị dựa trên `conversation.my_role` (owner/moderator/member).
 */
export default function GroupInfoPanel({
  conversation,
  currentUser,
  friends,
  isProcessing,
  onClose,
  onRenameGroup,
  onAddMember,
  onKickMember,
}: GroupInfoPanelProps) {
  const isAdmin = conversation.admin_id === currentUser.id;
  const myRole = (conversation.my_role ?? 'member') as GroupRole;
  const isOwnerOrMod = isAdmin || myRole === 'moderator';
  const showRequestsTab = conversation.join_type === 'request' && isOwnerOrMod;

  const [activeTab, setActiveTab] = useState<'members' | 'resources' | 'requests'>('members');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(conversation.name ?? '');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();

  const promoteMutation = useMutation({
    mutationFn: (userId: number) => communityApi.promoteModerator(conversation.id, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() }); }
  });

  const demoteMutation = useMutation({
    mutationFn: (userId: number) => communityApi.demoteModerator(conversation.id, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() }); }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    onRenameGroup({ avatar: file });
  };

  const handleSaveName = () => {
    if (!newName.trim() || newName.trim() === conversation.name) {
      setEditingName(false);
      return;
    }
    onRenameGroup({ name: newName.trim() });
    setEditingName(false);
  };

  const handlePromote = async (memberId: number) => {
    setOpenMenuId(null);
    setLoadingActionId(memberId);
    try {
      await promoteMutation.mutateAsync(memberId);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDemote = async (memberId: number) => {
    setOpenMenuId(null);
    setLoadingActionId(memberId);
    try {
      await demoteMutation.mutateAsync(memberId);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleKick = async (memberId: number) => {
    setOpenMenuId(null);
    const ok = await confirm({ title: 'Xóa thành viên', message: 'Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?', confirmLabel: 'Xóa', variant: 'danger' });
    if (ok) {
      setLoadingActionId(memberId);
      try {
        await onKickMember(memberId);
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  const memberIds = conversation.participants.map((p) => p.id);

  return (
    <>
      {/* Lớp phủ (Overlay) */}
      <div className="absolute inset-0 bg-black/20 z-10" onClick={onClose} />

      {/* Bảng điều khiển (Panel) */}
      <div className="absolute right-0 top-0 h-full w-[360px] bg-white border-l border-gray-100 z-20 flex flex-col shadow-2xl animate-slide-in-right">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-extrabold text-[#111827] text-[16px]">Thông tin nhóm</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-[#D70038] hover:bg-[#FFF1F2] p-1.5 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Group avatar + name ──────────────────────────────────── */}
        <div className="flex flex-col items-center py-6 px-5 border-b border-gray-100 flex-shrink-0">
          <div className="relative mb-3">
            {avatarPreview || conversation.avatar ? (
              <img
                src={avatarPreview ?? conversation.avatar ?? ''}
                alt="group"
                className="h-20 w-20 rounded-full object-cover border-2 border-[#FFE4E6] shadow-sm"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#FFF5F6] to-[#FFF1F2] flex items-center justify-center border-2 border-[#FECDD3] shadow-sm">
                <svg className="w-10 h-10 text-[#D70038]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-6 w-6 bg-[#D70038] text-white rounded-full flex items-center justify-center hover:bg-[#990028] shadow-md transition-colors border-2 border-white"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {/* Tên nhóm */}
          {editingName ? (
            <div className="flex items-center space-x-2 w-full px-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-grow text-center border border-[#FECDD3] bg-[#FFF5F6] rounded-xl px-3 py-1.5 text-[15px] font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D70038]/30"
                autoFocus
              />
              <button onClick={handleSaveName} disabled={isProcessing} className="text-[#D70038] hover:text-[#990028] text-[14px] font-bold">
                Lưu
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <h4 className="font-extrabold text-[#111827] text-[16px] text-center">{conversation.name ?? 'Nhóm không tên'}</h4>
              {isAdmin && (
                <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-[#D70038] p-1 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <p className="text-[13px] text-gray-500 mt-1 font-medium">{conversation.participants.length} thành viên</p>
        </div>

        {/* ── Tab Navigation ────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 text-[14px] font-bold border-b-2 transition-colors ${activeTab === 'members'
                ? 'border-[#D70038] text-[#D70038]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Thành viên
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 py-3 text-[14px] font-bold border-b-2 transition-colors ${activeTab === 'resources'
                ? 'border-[#D70038] text-[#D70038]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Tài liệu
          </button>
          {showRequestsTab && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 text-[14px] font-bold border-b-2 transition-colors ${activeTab === 'requests'
                  ? 'border-[#D70038] text-[#D70038]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              Yêu cầu duyệt
            </button>
          )}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────── */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {activeTab === 'members' ? (
            <div className="overflow-y-auto flex-grow px-3 py-2">
              {/* Nút Thêm thành viên */}
              <div className="flex items-center justify-between mb-3 mt-1">
                <h5 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Danh sách thành viên</h5>
                {/* Nút Thêm thành viên — Mọi thành viên đều có thể thêm bạn bè vào nhóm */}
                <button
                  onClick={() => setShowAddMembers(true)}
                  className="text-[13px] text-[#D70038] hover:text-white hover:bg-[#D70038] bg-[#FFF1F2] px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm
                </button>
              </div>

              <ul className="space-y-1">
                {conversation.participants.map((member: User) => (
                  <li key={member.id} className="flex items-center py-2.5 hover:bg-[#F9FAFB] rounded-xl px-2.5 group transition-colors">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name}
                        className="h-10 w-10 rounded-full object-cover mr-3 flex-shrink-0 border border-gray-100" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-[14px] font-bold mr-3 flex-shrink-0 border border-gray-200">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <span className="text-[14px] font-bold text-[#111827] truncate block">{member.name}</span>
                      {/* Nhãn chức vụ */}
                      {member.id === conversation.admin_id ? (
                        <span className="text-[11px] text-[#D70038] font-bold bg-[#FFF1F2] px-1.5 py-0.5 rounded mt-0.5 inline-block">Trưởng nhóm</span>
                      ) : (conversation.participants as Array<User & { role?: GroupRole }>)
                        .find(p => p.id === member.id)?.role === 'moderator' ? (
                        <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">Phó nhóm</span>
                      ) : null}
                    </div>
                    {/* Dropdown Quản lý chức vụ */}
                    {loadingActionId === member.id ? (
                      <div className="p-1">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#D70038] animate-spin" />
                      </div>
                    ) : isOwnerOrMod && member.id !== currentUser.id && member.id !== conversation.admin_id && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <HiOutlineEllipsisVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === member.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-6 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40 animate-fade-in">
                              {isAdmin && (
                                <>
                                  {(conversation.participants as Array<User & { role?: GroupRole }>).find(p => p.id === member.id)?.role === 'moderator' ? (
                                    <button
                                      onClick={() => handleDemote(member.id)}
                                      className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#D70038] transition-colors"
                                    >
                                      Giáng chức
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handlePromote(member.id)}
                                      className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#D70038] transition-colors"
                                    >
                                      Thăng Phó nhóm
                                    </button>
                                  )}
                                </>
                              )}
                              <button
                                onClick={() => handleKick(member.id)}
                                disabled={isProcessing}
                                className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Xóa khỏi nhóm
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : activeTab === 'resources' ? (
            /* Tab Tài liệu — ResourcePanel */
            <ResourcePanel
              conversationId={conversation.id}
              currentUser={currentUser}
              myRole={myRole}
            />
          ) : (
            <JoinRequestsTab conversationId={conversation.id} />
          )}
        </div>
      </div>

      {/* Modal thêm thành viên */}
      {showAddMembers && (
        <AddMembersModal
          friends={friends}
          existingMemberIds={memberIds}
          isProcessing={isProcessing}
          onClose={() => setShowAddMembers(false)}
          onAdd={(userId) => { onAddMember(userId); setShowAddMembers(false); }}
        />
      )}
    </>
  );
}
