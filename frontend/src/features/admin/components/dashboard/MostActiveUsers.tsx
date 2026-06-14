import type { DashboardStats } from '@/features/admin/api/adminApi';
import { Zap } from 'lucide-react';
import { getImageUrl } from '@/utils/getImageUrl';

interface MostActiveUsersProps {
  users?: DashboardStats['most_active_users'];
}

export function MostActiveUsers({ users }: MostActiveUsersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            User hoạt động nhiều
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Top user 7 ngày qua</p>
        </div>
      </div>

      {!users || users.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Chưa có dữ liệu người dùng
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => {
            const totalActivity = user.posts_count + user.messages_count;
            const maxActivity = Math.max(...(users?.map(u => u.posts_count + u.messages_count) || [1]), 1);
            const percentage = Math.round((totalActivity / maxActivity) * 100);

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
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
                  {user.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white shadow-sm">
                      <span className="text-xs font-bold text-white">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    {user.is_banned && (
                      <span className="text-[10px] font-semibold bg-red-50 text-red-500 px-1.5 py-0.5 rounded">Khoá</span>
                    )}
                  </div>

                  {/* Activity bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs font-bold text-indigo-600">{user.posts_count}</p>
                    <p className="text-[10px] text-gray-400">bài viết</p>
                  </div>
                  <div className="w-px h-6 bg-gray-100" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-amber-600">{user.messages_count}</p>
                    <p className="text-[10px] text-gray-400">tin nhắn</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
