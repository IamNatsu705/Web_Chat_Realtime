import { useState, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCreatePostMutation } from '../hooks/queries';
import { getImageUrl } from '@/utils/getImageUrl';
import { HiXMark } from 'react-icons/hi2';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center text-indigo-800 font-bold overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <textarea
          className="grow resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          rows={3}
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Media previews */}
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

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex space-x-1">
          <input type="file" ref={fileInputRef} multiple accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
          >
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
            <span>Ảnh/Video</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={createPost.isPending || (!content.trim() && mediaFiles.length === 0)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPost.isPending ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </div>
    </div>
  );
}
