import type { AdminUser } from '@/features/admin/api/adminApi';
import { Calendar, Lock, Unlock } from 'lucide-react';

interface UsersTableProps {
  users?: AdminUser[];
  isLoading: boolean;
  onBanClick: (user: AdminUser) => void;
  onUnbanClick: (userId: number) => void;
  isUnbanPending: boolean;
}

export function UsersTable({
  users,
  isLoading,
  onBanClick,
  onUnbanClick,
  isUnbanPending,
}: UsersTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
            <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Người dùng</th>
            <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Ngày đăng ký</th>
            <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Trạng thái</th>
            <th className="text-right px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
                </div>
              </td>
            </tr>
          ) : !users || users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                Không tìm thấy người dùng nào
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{user.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{user.email}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100/50">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.is_banned
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.is_banned ? 'Đã khoá' : 'Hoạt động'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Ban / Unban */}
                    {user.is_banned ? (
                      <button
                        onClick={() => onUnbanClick(user.id)}
                        disabled={isUnbanPending}
                        title="Mở khoá tài khoản"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Mở khoá</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onBanClick(user)}
                        title="Khoá tài khoản"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Khoá</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
