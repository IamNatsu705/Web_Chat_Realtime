import { useState } from 'react';
import { getImageUrl } from '@/utils/getImageUrl';
import type { Post } from '@/features/post/types';
import { Eye, EyeOff, RotateCcw, Heart, MessageCircle, ImageIcon } from 'lucide-react';
import { HideReasonModal } from './HideReasonModal';

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

interface PostsTableProps {
  posts: Post[];
  onViewDetail: (post: Post) => void;
  onHidePost: (postId: number, reason: string) => void;
  onRestorePost: (postId: number) => void;
  isHidePending: boolean;
  isRestorePending: boolean;
}

export function PostsTable({
  posts,
  onViewDetail,
  onHidePost,
  onRestorePost,
  isHidePending,
  isRestorePending,
}: PostsTableProps) {
  const [hideTarget, setHideTarget] = useState<Post | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tác giả</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Tương tác</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày đăng</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => {
              const avatarUrl = post.user?.avatar ? getImageUrl(post.user.avatar) : null;
              const isHidden = post.status === 'hidden';

              return (
                <tr key={post.id} className={`hover:bg-gray-50/50 transition-colors ${isHidden ? 'bg-amber-50/30' : ''}`}>
                  {/* Author */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          post.user?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {post.user?.name}
                      </span>
                    </div>
                  </td>

                  {/* Content */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">{post.content}</p>
                    {post.media?.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {post.media.length} ảnh/video
                      </span>
                    )}
                  </td>

                  {/* Interaction */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        {post.likes_count}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.comments_count}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        isHidden
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isHidden ? (
                          <><EyeOff className="w-3.5 h-3.5" /> Đã ẩn</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5" /> Hiển thị</>
                        )}
                      </span>
                      {isHidden && post.hide_reason && (
                        <span className="text-[10px] text-amber-600 max-w-[120px] truncate" title={post.hide_reason}>
                          {post.hide_reason}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-sm text-gray-500">{timeAgo(post.created_at)}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View detail */}
                      <button
                        onClick={() => onViewDetail(post)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Hide / Restore */}
                      {isHidden ? (
                        <button
                          onClick={() => onRestorePost(post.id)}
                          disabled={isRestorePending}
                          className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Khôi phục bài viết"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setHideTarget(post)}
                          disabled={isHidePending}
                          className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Ẩn bài viết"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-400 text-sm">Không tìm thấy bài viết nào</p>
          </div>
        )}
      </div>

      {/* Hide reason modal */}
      <HideReasonModal
        isOpen={!!hideTarget}
        onClose={() => setHideTarget(null)}
        onConfirm={(reason) => {
          if (hideTarget) {
            onHidePost(hideTarget.id, reason);
            setHideTarget(null);
          }
        }}
        isPending={isHidePending}
        postContent={hideTarget?.content}
      />
    </>
  );
}
