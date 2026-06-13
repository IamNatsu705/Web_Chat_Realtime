import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useCreateCommentMutation, useDeleteCommentMutation } from '../hooks/queries';
import { getImageUrl } from '@/utils/getImageUrl';
import type { Comment } from '../api/postApi';
import { HiOutlineTrash } from 'react-icons/hi2';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

/**
 * CommentItem — Component hiển thị một bình luận hoặc phản hồi.
 *
 * Hỗ trợ hiển thị nội dung, thông tin người dùng,
 * cho phép trả lời (hiển thị inline input) và xoá bình luận.
 */

interface CommentItemProps {
  comment: Comment;
  postId: number;
  postOwnerId: number;
  isReply?: boolean;
}

const CommentItem = memo(function CommentItem({
  comment,
  postId,
  postOwnerId,
  isReply = false,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const createComment = useCreateCommentMutation();
  const deleteComment = useDeleteCommentMutation();

  const avatarUrl = comment.user?.avatar ? getImageUrl(comment.user.avatar) : null;
  const canDelete =
    user?.id === comment.user_id ||
    user?.id === postOwnerId ||
    user?.role === 'admin';

  const handleReply = () => {
    if (!replyText.trim() || createComment.isPending) return;
    const text = replyText.trim();
    setReplyText('');
    setShowReplyInput(false);
    createComment.mutate({ postId, content: text, parentId: comment.id });
  };

  const handleDelete = () => {
    if (deleteComment.isPending) return;
    deleteComment.mutate({ commentId: comment.id, postId });
  };

  const replies = comment.replies ?? [];

  return (
    <div className={`comment-item-enter ${isReply ? 'ml-10' : ''}`}>
      <div className="flex items-start gap-2.5 group">
        {/* Hình đại diện (Avatar) */}
        <Link
          to={`/profile/${comment.user_id}`}
          className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white font-semibold overflow-hidden hover:opacity-80 transition-opacity ${isReply ? 'text-[10px]' : 'text-xs'}`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            comment.user?.name?.charAt(0).toUpperCase()
          )}
        </Link>

        {/* Nội dung bình luận */}
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-full">
            <div className="bg-gray-100 rounded-2xl px-3.5 py-2 inline-block relative group/bubble">
              <Link
                to={`/profile/${comment.user_id}`}
                className="font-semibold text-[13px] text-gray-900 hover:text-indigo-600 hover:underline transition-colors leading-tight"
              >
                {comment.user?.name}
              </Link>
              <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap break-words mt-0.5">
                {comment.content}
              </p>

              {/* Nút xoá - hiện ra khi hover */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleteComment.isPending}
                  className="absolute -right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 disabled:opacity-30"
                  title="Xoá bình luận"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Thanh hành động (Trả lời, Thời gian) */}
          <div className="flex items-center gap-3 mt-0.5 ml-3">
            {!isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-[11px] font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
              >
                Trả lời
              </button>
            )}
            <span className="text-[11px] text-gray-400">
              {timeAgo(comment.created_at)}
            </span>
          </div>

          {/* Ô nhập phản hồi hiển thị nội tuyến */}
          {showReplyInput && (
            <div className="flex items-center gap-2 mt-2 ml-1 comment-item-enter">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white text-[9px] font-semibold overflow-hidden">
                {user?.avatar ? (
                  <img src={getImageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 flex items-center bg-gray-100 rounded-full overflow-hidden border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
                <input
                  type="text"
                  className="flex-1 bg-transparent px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none"
                  placeholder={`Trả lời ${comment.user?.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                    if (e.key === 'Escape') {
                      setShowReplyInput(false);
                      setReplyText('');
                    }
                  }}
                  autoFocus
                  disabled={createComment.isPending}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || createComment.isPending}
                  className="px-3 py-1.5 text-indigo-600 hover:text-indigo-700 font-semibold text-[12px] disabled:opacity-30 transition-opacity"
                >
                  {createComment.isPending ? '...' : 'Gửi'}
                </button>
              </div>
            </div>
          )}

          {/* Danh sách phản hồi (chỉ dành cho bình luận gốc, hiển thị tối đa 2 cấp) */}
          {!isReply && replies.length > 0 && (
            <div className="mt-2">
              {replies.length > 2 && !showReplies && (
                <button
                  onClick={() => setShowReplies(true)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 ml-1 mb-1.5 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Xem {replies.length} phản hồi
                </button>
              )}

              {(showReplies || replies.length <= 2) && (
                <div className="space-y-2">
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      postOwnerId={postOwnerId}
                      isReply={true}
                    />
                  ))}
                </div>
              )}

              {showReplies && replies.length > 2 && (
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-[12px] font-semibold text-gray-500 hover:text-indigo-600 ml-11 mt-1 transition-colors"
                >
                  Ẩn phản hồi
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CommentItem;
