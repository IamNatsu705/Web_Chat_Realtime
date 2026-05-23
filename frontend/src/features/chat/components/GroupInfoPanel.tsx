import { useState, useRef } from 'react';
import type { Conversation, UpdateGroupRequest } from '../types';
import type { User } from '../../auth/types';
import type { Friendship } from '../../network/types';
import AddMembersModal from './AddMembersModal';

interface GroupInfoPanelProps {
  conversation: Conversation;
  currentUser: User;
  friends: Friendship[];
  isProcessing: boolean;
  onClose: () => void;
  onRenameGroup: (data: UpdateGroupRequest) => void;
  onAddMember: (userId: number) => void;
  onKickMember: (userId: number) => void;
}

/**
 * GroupInfoPanel — right slide-in panel showing group details.
 *
 * Admin sees:
 *   - Change group name / avatar
 *   - List of members with Kick button
 *   - Add members button
 *
 * Regular members see:
 *   - Group name, avatar (read-only)
 *   - Member list (no kick)
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
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(conversation.name ?? '');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const memberIds = conversation.participants.map((p) => p.id);

  return (
    <>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 z-10"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-gray-200 z-20 flex flex-col shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Thông tin nhóm</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {/* Group avatar + name */}
          <div className="flex flex-col items-center py-6 px-4 border-b border-gray-100">
            <div className="relative mb-3">
              {avatarPreview || conversation.avatar ? (
                <img
                  src={avatarPreview ?? conversation.avatar ?? ''}
                  alt="group"
                  className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                  <svg className="w-9 h-9 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-6 w-6 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>

            {/* Group name */}
            {editingName ? (
              <div className="flex items-center space-x-2 w-full px-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="flex-grow text-center border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={isProcessing}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Lưu</button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <h4 className="font-bold text-gray-900 text-base text-center">
                  {conversation.name ?? 'Nhóm không tên'}
                </h4>
                {isAdmin && (
                  <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-gray-600 p-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {conversation.participants.length} thành viên
            </p>
          </div>

          {/* Members list */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Thành viên
              </h5>
              <button
                onClick={() => setShowAddMembers(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
              >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Thêm</span>
              </button>
            </div>

            <ul className="space-y-1">
              {conversation.participants.map((member: User) => (
                <li key={member.id} className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 group">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name}
                      className="h-8 w-8 rounded-full object-cover mr-2.5 flex-shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2.5 flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <span className="text-sm text-gray-800 truncate block">{member.name}</span>
                    {member.id === conversation.admin_id && (
                      <span className="text-[10px] text-indigo-600 font-semibold">Trưởng nhóm</span>
                    )}
                  </div>
                  {/* Kick button — admin only, not for self */}
                  {isAdmin && member.id !== currentUser.id && member.id !== conversation.admin_id && (
                    <button
                      onClick={() => onKickMember(member.id)}
                      disabled={isProcessing}
                      title="Xóa khỏi nhóm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add members modal */}
      {showAddMembers && (
        <AddMembersModal
          friends={friends}
          existingMemberIds={memberIds}
          isProcessing={isProcessing}
          onClose={() => setShowAddMembers(false)}
          onAdd={(userId) => {
            onAddMember(userId);
            setShowAddMembers(false);
          }}
        />
      )}
    </>
  );
}
