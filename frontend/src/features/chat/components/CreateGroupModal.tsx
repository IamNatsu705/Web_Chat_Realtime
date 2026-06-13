import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Friendship } from '../../network/types';
import type { CreateGroupRequest, JoinType, CommunityCategory } from '../types';

const CATEGORY_OPTIONS: { value: CommunityCategory; label: string }[] = [
  { value: 'subject', label: 'Môn học' },
  { value: 'department', label: 'Chuyên ngành' },
  { value: 'project', label: 'Đồ án' },
  { value: 'research', label: 'Nghiên cứu khoa học' },
  { value: 'club', label: 'Câu lạc bộ / Sở thích' },
  { value: 'other', label: 'Khác' },
];

interface CreateGroupModalProps {
  friends: Friendship[];
  isProcessing: boolean;
  onClose: () => void;
  onCreate: (data: CreateGroupRequest) => void;
}

/**
 * CreateGroupModal — Hộp thoại để tạo nhóm chat mới.
 *
 * - Nhập tên nhóm (bắt buộc)
 * - Chọn ít nhất 2 người bạn qua danh sách checkbox (đối với nhóm riêng tư)
 * - Tùy chọn tải lên ảnh đại diện nhóm (kèm xem trước)
 * - Chỉ những người bạn của người dùng hiện tại mới có thể được chọn
 */
export default function CreateGroupModal({
  friends,
  isProcessing,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [joinType, setJoinType] = useState<JoinType>('invite');
  const [category, setCategory] = useState<CommunityCategory | ''>('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCommunity = joinType !== 'invite';

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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      // Xoá file đã chọn nếu vượt giới hạn
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    setError('');
    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm.');
      return;
    }
    // Nhóm private cần ít nhất 2 thành viên, community không bắt buộc
    if (!isCommunity && selectedIds.size < 2) {
      setError('Vui lòng chọn ít nhất 2 thành viên.');
      return;
    }
    onCreate({
      name: groupName.trim(),
      description: description.trim() || undefined,
      join_type: joinType,
      category: isCommunity && category ? category : undefined,
      member_ids: Array.from(selectedIds),
      avatar: avatarFile,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] w-full max-w-[540px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Thanh đỏ trên cùng */}
        <div className="h-2 bg-gradient-to-r from-[#D70038] to-[#990028] w-full"></div>

        {/* Tiêu đề */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#F3F4F6]">
          <h3 className="text-[20px] font-extrabold text-[#111827]">Tạo nhóm mới</h3>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#D70038] hover:bg-[#FFF1F2] transition-colors p-2 rounded-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="flex-grow overflow-y-auto px-7 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Hàng: Tải ảnh đại diện & Tên nhóm */}
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group block"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Group Avatar"
                    className="h-20 w-20 rounded-[20px] object-cover border border-[#FFE4E6] shadow-sm group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-[20px] bg-gradient-to-br from-[#FFF5F6] to-[#FFF1F2] border border-[#FECDD3] flex flex-col items-center justify-center text-[#D70038] hover:border-[#D70038] transition-colors shadow-[0_2px_8px_rgba(215,0,56,0.08)] group-hover:scale-105">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-bold mt-1 uppercase">Ảnh nhóm</span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-gray-100 text-[#D70038] group-hover:text-white group-hover:bg-[#D70038] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-grow">
              <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide">
                Tên nhóm <span className="text-[#D70038]">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                maxLength={100}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-[15px] font-medium text-[#111827] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D70038]/20 focus:border-[#D70038]/40 placeholder:text-[#9CA3AF] transition-all"
              />
            </div>
          </div>

          {/* Chọn quyền riêng tư */}
          <div>
            <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide">Quyền riêng tư</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'invite' as JoinType, label: 'Riêng tư', desc: 'Chỉ mời' },
                { value: 'open' as JoinType, label: 'Công khai', desc: 'Ai cũng vào' },
                { value: 'request' as JoinType, label: 'Yêu cầu', desc: 'Cần duyệt' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setJoinType(opt.value)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all ${
                    joinType === opt.value
                      ? 'border-[#D70038] bg-[#FFF1F2] text-[#D70038] shadow-[0_4px_12px_rgba(215,0,56,0.15)] scale-[1.02]'
                      : 'border-[#E5E7EB] text-[#4B5563] hover:border-[#FECDD3] hover:bg-[#FFF5F6]'
                  }`}
                >
                  <div className="font-bold text-[14px]">{opt.label}</div>
                  <div className={`text-[11px] mt-1 ${joinType === opt.value ? 'text-[#D70038]/80' : 'text-[#9CA3AF]'}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mô tả (dành cho nhóm cộng đồng) */}
          {isCommunity && (
            <div>
              <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide">Mô tả nhóm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về nhóm (hiển thị trên trang Cộng đồng)..."
                maxLength={1000}
                rows={3}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-[15px] text-[#111827] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D70038]/20 focus:border-[#D70038]/40 placeholder:text-[#9CA3AF] transition-all resize-none"
              />
            </div>
          )}

          {/* Danh mục (dành cho nhóm cộng đồng) */}
          {isCommunity && (
            <div>
              <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-[15px] font-medium text-[#111827] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D70038]/20 focus:border-[#D70038]/40 transition-all cursor-pointer"
              >
                <option value="" className="text-gray-400">Chọn danh mục...</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Danh sách chọn bạn bè */}
          <div>
            <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide flex items-center justify-between">
              <span>Thêm thành viên</span>
              <span className="text-[12px] text-[#9CA3AF] font-medium normal-case">
                {selectedIds.size} đã chọn {(!isCommunity) ? '(Tối thiểu 2)' : ''}
              </span>
            </label>

            {friends.length === 0 ? (
              <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-6 text-center">
                <p className="text-[14px] text-[#6B7280]">Bạn chưa có bạn bè nào để thêm.</p>
              </div>
            ) : (
              <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl divide-y divide-[#F3F4F6] max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {friends.map(({ friend }) => {
                  if (!friend) return null;
                  const checked = selectedIds.has(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleUser(friend.id)}
                      className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                        checked ? 'bg-[#FFF5F6]' : 'hover:bg-white'
                      }`}
                    >
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name}
                          className="h-10 w-10 rounded-full object-cover mr-3.5 flex-shrink-0 border border-gray-100" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-[15px] font-bold mr-3.5 flex-shrink-0 border border-gray-200">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={`flex-grow text-[15px] ${checked ? 'font-bold text-[#D70038]' : 'font-medium text-[#374151]'}`}>
                        {friend.name}
                      </span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${checked ? 'bg-[#D70038] border-[#D70038]' : 'bg-white border-[#D1D5DB]'}`}>
                        {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-[#FFF1F2] border border-[#FECDD3] text-[#D70038] text-[14px] font-medium rounded-xl px-4 py-3">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
        </div>

        {/* Phần chân */}
        <div className="flex space-x-3 px-7 py-5 border-t border-[#F3F4F6] bg-[#F9FAFB]">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 hover:text-[#111827] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !groupName.trim() || (!isCommunity && selectedIds.size < 2)}
            className="flex-1 py-3 bg-gradient-to-r from-[#D70038] to-[#E6003C] text-white rounded-xl text-[14px] font-bold shadow-[0_4px_12px_rgba(215,0,56,0.25)] hover:shadow-[0_6px_16px_rgba(215,0,56,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? 'Đang tạo...' : isCommunity ? 'Tạo nhóm cộng đồng' : 'Tạo nhóm chat'}
          </button>
        </div>
      </div>
    </div>
  );
}
