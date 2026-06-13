import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCommentsQuery, useCreateCommentMutation } from '../hooks/queries';
import { getImageUrl } from '@/utils/getImageUrl';
import CommentItem from './CommentItem';
import { HiOutlineChatBubbleOvalLeft } from 'react-icons/hi2';

interface CommentSectionProps {
  postId: number;
  postOwnerId: number;
}

/**
 * CommentSection — Khu vực hiển thị và nhập bình luận cho bài viết.
 *
 * Tự động focus vào ô nhập khi mở, lấy danh sách bình luận
 * qua API và hỗ trợ gửi bình luận mới.
 */

export default function CommentSection({ postId, postOwnerId }: CommentSectionProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: commentsData, isLoading } = useCommentsQuery(postId);
  const createComment = useCreateCommentMutation();

  const comments = commentsData?.comments ?? [];

  // Tự động focus vào ô nhập liệu khi component mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (!commentText.trim() || createComment.isPending) return;
    const text = commentText.trim();
    setCommentText('');
    createComment.mutate({ postId, content: text });
  };

  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : null;

  return (
    <div className="border-t border-gray-100 comment-section-enter">
      {/* Ô nhập bình luận */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/50">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 flex items-center bg-white rounded-full border border-gray-200 overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            placeholder="Viết bình luận..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={createComment.isPending}
          />
          <button
            onClick={handleSubmit}
            disabled={!commentText.trim() || createComment.isPending}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm disabled:opacity-30 transition-opacity shrink-0"
          >
            {createComment.isPending ? (
              <div className="h-4 w-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              'Gửi'
            )}
          </button>
        </div>
      </div>

      {/* Danh sách bình luận */}
      <div className="px-4 pb-3">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="ml-2 text-xs text-gray-400">Đang tải bình luận...</span>
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <div className="flex flex-col items-center py-4 text-gray-400">
            <HiOutlineChatBubbleOvalLeft className="w-8 h-8 mb-1 opacity-50" />
            <span className="text-xs">Chưa có bình luận nào. Hãy là người đầu tiên!</span>
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-3 mt-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                postOwnerId={postOwnerId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
