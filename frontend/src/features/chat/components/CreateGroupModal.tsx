import { useState, useRef } from 'react';
import type { Friendship } from '../../network/types';
import type { CreateGroupRequest } from '../types';

interface CreateGroupModalProps {
  friends: Friendship[];
  isProcessing: boolean;
  onClose: () => void;
  onCreate: (data: CreateGroupRequest) => void;
}

/**
 * CreateGroupModal — dialog to create a new group chat.
 *
 * - Input group name (required)
 * - Select at least 2 friends via checkbox list
 * - Optional group avatar upload with preview
 * - Only friends of the current user can be selected
 */
export default function CreateGroupModal({
  friends,
  isProcessing,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleUser = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    setError('');
    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm.');
      return;
    }
    if (selectedIds.size < 2) {
      setError('Vui lòng chọn ít nhất 2 thành viên.');
      return;
    }
    onCreate({
      name: groupName.trim(),
      member_ids: Array.from(selectedIds),
      avatar: avatarFile,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Tạo nhóm mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-5">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Group Avatar"
                  className="h-20 w-20 rounded-full object-cover border-2 border-indigo-300"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-100 transition-colors">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs mt-1">Ảnh nhóm</span>
                </div>
              )}
              <span className="absolute inset-0 rounded-full group-hover:bg-black/10 transition-colors" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Group name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm..."
              maxLength={100}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
          </div>

          {/* Friend selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Thêm thành viên{' '}
              <span className="text-gray-400 font-normal">
                ({selectedIds.size} đã chọn, tối thiểu 2)
              </span>
            </label>

            {friends.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">
                Bạn chưa có bạn bè nào để thêm.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto">
                {friends.map(({ friend }) => {
                  if (!friend) return null;
                  const checked = selectedIds.has(friend.id);
                  return (
                    <label
                      key={friend.id}
                      className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                        checked ? 'bg-indigo-50' : ''
                      }`}
                    >
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name}
                          className="h-8 w-8 rounded-full object-cover mr-3 flex-shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold mr-3 flex-shrink-0">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="flex-grow text-sm text-gray-800">{friend.name}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(friend.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !groupName.trim() || selectedIds.size < 2}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
}
