import { useQuery } from '@tanstack/react-query';
import { getImageUrl } from '@/utils/getImageUrl';
import { postApi } from '@/features/post/api/postApi';
import type { Post, Comment } from '@/features/post/types';
import { HiOutlineXMark, HiOutlineEyeSlash, HiOutlineHeart, HiOutlineChatBubbleOvalLeft } from 'react-icons/hi2';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

function ReadOnlyComment({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
  const avatarUrl = comment.user?.avatar ? getImageUrl(comment.user.avatar) : null;
  const replies = comment.replies ?? [];

  return (
    <div className={isReply ? 'ml-10' : ''}>
      <div className="flex items-start gap-2.5">
        <div className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white font-semibold overflow-hidden ${isReply ? 'text-[10px]' : 'text-xs'}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            comment.user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-full">
            <div className="bg-gray-100 rounded-2xl px-3.5 py-2 inline-block">
              <span className="font-semibold text-[13px] text-gray-900 leading-tight">
                {comment.user?.name}
              </span>
              <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap break-words mt-0.5">
                {comment.content}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-0.5 ml-3">
            <span className="text-[11px] text-gray-400">{timeAgo(comment.created_at)}</span>
          </div>

          {/* Nested replies */}
          {!isReply && replies.length > 0 && (
            <div className="space-y-2 mt-2">
              {replies.map((reply) => (
                <ReadOnlyComment key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['admin', 'post-comments', post?.id],
    queryFn: async () => {
      if (!post) return null;
      const res = await postApi.getComments(post.id, 1);
      return res.data;
    },
    enabled: !!post,
    staleTime: 60_000,
  });

  if (!post) return null;

  const avatarUrl = post.user?.avatar ? getImageUrl(post.user.avatar) : null;
  const isHidden = post.status === 'hidden';
  const comments: Comment[] = commentsData?.comments ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Chi tiết bài viết</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post content */}
          <div className="px-6 py-5">
            {/* Author info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  post.user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{post.user?.name}</span>
                  {isHidden && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                      <HiOutlineEyeSlash className="w-3 h-3" />
                      Đã ẩn
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Hidden reason alert */}
            {isHidden && post.hide_reason && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <HiOutlineEyeSlash className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Lý do ẩn bài viết:</p>
                    <p className="text-sm text-amber-800 mt-0.5">{post.hide_reason}</p>
                    {post.hidden_by_admin && (
                      <p className="text-[11px] text-amber-600 mt-1">Ẩn bởi: {post.hidden_by_admin}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>

            {/* Media grid */}
            {post.media && post.media.length > 0 && (
              <div className={`mt-4 grid gap-2 ${
                post.media.length === 1 ? 'grid-cols-1' :
                post.media.length === 2 ? 'grid-cols-2' :
                post.media.length === 3 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {post.media.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`rounded-xl overflow-hidden bg-gray-100 ${
                      post.media.length === 3 && idx === 0 ? 'row-span-2' : ''
                    }`}
                  >
                    {m.media_type === 'video' ? (
                      <video
                        src={getImageUrl(m.media_url)}
                        controls
                        className="w-full h-full object-cover max-h-80"
                      />
                    ) : (
                      <img
                        src={getImageUrl(m.media_url)}
                        alt=""
                        className="w-full h-full object-cover max-h-80"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                <HiOutlineHeart className="w-5 h-5 text-pink-400" />
                <span className="font-medium">{post.likes_count}</span> lượt thích
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                <HiOutlineChatBubbleOvalLeft className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{post.comments_count}</span> bình luận
              </span>
            </div>
          </div>

          {/* Comments section */}
          <div className="border-t border-gray-100">
            <div className="px-6 py-3 bg-gray-50/80">
              <h4 className="text-sm font-semibold text-gray-700">
                Bình luận ({post.comments_count})
              </h4>
            </div>

            <div className="px-6 py-4">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <ReadOnlyComment key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HiOutlineChatBubbleOvalLeft className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Chưa có bình luận nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
