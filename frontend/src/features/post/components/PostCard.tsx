import { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToggleLikeMutation, useDeletePostMutation } from '../hooks/queries';
import { getImageUrl } from '@/utils/getImageUrl';
import type { Post } from '../api/postApi';
import CommentSection from './CommentSection';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

interface PostCardProps {
  post: Post;
}

/**
 * PostCard — Component hiển thị một bài viết.
 *
 * Bao gồm: thông tin người đăng, nội dung, đa phương tiện (ảnh/video),
 * số lượt thích/bình luận, và các nút tương tác.
 * Nếu là bài viết của chính người dùng, cung cấp thêm menu ẩn/xoá bài.
 */

const PostCard = memo(function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const toggleLike = useToggleLikeMutation();
  const deletePost = useDeletePostMutation();

  const avatarUrl = post.user?.avatar ? getImageUrl(post.user.avatar) : null;

  const handleLike = useCallback(() => {
    if (toggleLike.isPending) return;
    toggleLike.mutate(post.id);
  }, [toggleLike, post.id]);

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xoá bài viết này?')) {
      deletePost.mutate(post.id);
    }
    setShowMenu(false);
  };

  const isOwner = user?.id === post.user_id;

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E5E7EB] overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(215,0,56,0.06)]">
      {/* Phần đầu: Thông tin người dùng & Menu tùy chọn */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center space-x-3.5">
          <Link to={`/profile/${post.user_id}`} className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-[#FFF5F6] to-[#FFF1F2] shrink-0 flex items-center justify-center text-[#D70038] font-bold overflow-hidden border border-[#FFE4E6] shadow-sm hover:scale-105 transition-transform">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg">{post.user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </Link>
          <div>
            <Link to={`/profile/${post.user_id}`} className="text-[15px] font-bold text-[#111827] hover:text-[#D70038] transition-colors leading-tight block">
              {post.user?.name}
            </Link>
            <p className="text-[13px] text-[#6B7280] mt-0.5">{timeAgo(post.created_at)} • Công khai</p>
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-10">
                <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  Xoá bài viết
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Nội dung bài viết */}
      <div className="px-5 pb-4">
        <p className="text-[#374151] text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Tệp đính kèm (Ảnh/Video) */}
      {post.media && post.media.length > 0 && (
        <div className={`px-5 pb-4 ${post.media.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
          {post.media.map((m) => (
            <div key={m.id} className="rounded-lg overflow-hidden bg-gray-100">
              {m.media_type === 'video' ? (
                <video src={m.media_url} controls className="w-full max-h-80 object-cover" />
              ) : (
                <img src={m.media_url} alt="" className="w-full max-h-80 object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Thống kê (Lượt thích, Bình luận) */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span>{post.likes_count > 0 ? `${post.likes_count} lượt thích` : ''}</span>
        <button onClick={() => setShowComments(!showComments)} className="hover:underline">
          {post.comments_count > 0 ? `${post.comments_count} bình luận` : ''}
        </button>
      </div>

      {/* Các nút tương tác (Thích, Bình luận) */}
      <div className="border-t border-[#F3F4F6] px-5 py-2.5 flex justify-around">
        <button
          onClick={handleLike}
          disabled={toggleLike.isPending}
          className={`flex-1 flex items-center justify-center space-x-2 font-semibold text-[14px] py-2 mx-1 rounded-xl transition-all duration-300 disabled:opacity-60 ${
            post.is_liked 
              ? 'text-[#D70038] bg-[#FFF1F2]' 
              : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#4B5563]'
          }`}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${post.is_liked ? 'scale-110 drop-shadow-sm' : ''}`} fill={post.is_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>Thích</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-2 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#4B5563] font-semibold text-[14px] py-2 mx-1 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Bình luận</span>
        </button>
      </div>

      {/* Khu vực Bình luận */}
      {showComments && (
        <CommentSection postId={post.id} postOwnerId={post.user_id} />
      )}
    </div>
  );
});

export default PostCard;
