import type { DashboardStats } from '@/features/admin/api/adminApi';
import { Flame, Heart, MessageCircle } from 'lucide-react';

interface TopEngagementPostsProps {
  posts?: DashboardStats['top_posts'];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function TopEngagementPosts({ posts }: TopEngagementPostsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Bài viết tương tác cao
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Top bài viết 7 ngày qua</p>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Chưa có dữ liệu bài viết
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              {/* Rank */}
              <div className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-amber-100 text-amber-700' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {index + 1}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {post.user?.avatar ? (
                  <img src={post.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">
                      {post.user?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 line-clamp-1">{post.content || '(Không có nội dung)'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-gray-400">{post.user?.name}</span>
                  <span className="text-[11px] text-gray-300">•</span>
                  <span className="text-[11px] text-gray-400">{timeAgo(post.created_at)}</span>
                </div>
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-[11px] text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span className="font-semibold">{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-semibold">{post.comments_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
