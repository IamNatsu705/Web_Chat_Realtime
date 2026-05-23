import { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToggleLikeMutation, useDeletePostMutation } from '../hooks/queries';
import { getImageUrl } from '@/utils/getImageUrl';
import type { Post } from '../api/postApi';
import { BsPinAngleFill } from 'react-icons/bs';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.user_id}`} className="h-10 w-10 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center text-indigo-800 font-bold overflow-hidden hover:opacity-80 transition-opacity">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              post.user?.name?.charAt(0).toUpperCase()
            )}
          </Link>
          <div>
            <Link to={`/profile/${post.user_id}`} className="text-sm font-bold text-gray-900 hover:text-indigo-600 hover:underline transition-colors">
              {post.user?.name}
            </Link>
            <p className="text-xs text-gray-500">{timeAgo(post.created_at)} • Công khai</p>
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

      {/* Pin badge */}
      {post.is_pinned && (
        <div className="px-4 pb-1">
          <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            <BsPinAngleFill className="w-3 h-3 mr-1" />
            Bài ghim
          </span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={`px-4 pb-3 ${post.media.length === 1 ? '' : 'grid grid-cols-2 gap-1'}`}>
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

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span>{post.likes_count > 0 ? `${post.likes_count} lượt thích` : ''}</span>
        <button onClick={() => setShowComments(!showComments)} className="hover:underline">
          {post.comments_count > 0 ? `${post.comments_count} bình luận` : ''}
        </button>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-2 flex justify-around">
        <button
          onClick={handleLike}
          disabled={toggleLike.isPending}
          className={`flex items-center space-x-1.5 font-medium text-sm py-1.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 ${
            post.is_liked 
              ? 'text-indigo-600 bg-indigo-50 scale-105' 
              : 'text-gray-500 hover:bg-gray-50 active:scale-95'
          }`}
        >
          <svg className={`w-5 h-5 transition-transform duration-200 ${post.is_liked ? 'scale-110' : ''}`} fill={post.is_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>Thích</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1.5 text-gray-500 hover:bg-gray-50 font-medium text-sm py-1.5 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Bình luận</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post.id} postOwnerId={post.user_id} />
      )}
    </div>
  );
});

export default PostCard;
