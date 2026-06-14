import { useState, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCreatePostMutation } from '../hooks/queries';
import { getImageUrl } from '@/utils/getImageUrl';
import { HiXMark } from 'react-icons/hi2';

/**
 * CreatePost — Component đăng bài viết mới.
 *
 * Cho phép nhập nội dung văn bản và đính kèm tối đa 4 tệp (ảnh/video).
 */

export default function CreatePost() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePostMutation();

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 4) {
      alert('Tối đa 4 file!');
      return;
    }
    setMediaFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    try {
      await createPost.mutateAsync({ content: content.trim(), media: mediaFiles.length > 0 ? mediaFiles : undefined });
      setContent('');
      setMediaFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error('Lỗi đăng bài:', err);
    }
  };

  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : null;

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(215,0,56,0.06)]">
      <div className="flex items-start space-x-4">
        <div className="h-12 w-12 rounded-[16px] bg-gradient-to-br from-[#FFF5F6] to-[#FFF1F2] shrink-0 flex items-center justify-center text-[#D70038] font-bold overflow-hidden border border-[#FFE4E6] shadow-[0_2px_8px_rgba(215,0,56,0.08)]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <textarea
          className="grow resize-none bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3 text-[15px] text-[#111827] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D70038]/20 focus:border-[#D70038]/40 placeholder:text-[#9CA3AF] transition-all"
          rows={3}
          placeholder="Bạn muốn thảo luận gì với cộng đồng PTIT?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Xem trước tệp đính kèm */}
      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((preview, i) => (
            <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeMedia(i)}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-black/80"
              >
                <HiXMark className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
        <div className="flex space-x-2">
          <input type="file" ref={fileInputRef} multiple accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 text-[#6B7280] hover:text-[#D70038] hover:bg-[#FFF1F2] px-3.5 py-2 rounded-xl transition-all font-medium text-[14px]"
          >
            <svg className="w-5 h-5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
            <span>Video</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={createPost.isPending || (!content.trim() && mediaFiles.length === 0)}
          className="bg-gradient-to-r from-[#D70038] to-[#E6003C] text-white px-6 py-2.5 rounded-xl text-[14px] font-semibold shadow-sm hover:shadow-[0_4px_12px_rgba(215,0,56,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {createPost.isPending ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </div>
    </div>
  );
}
