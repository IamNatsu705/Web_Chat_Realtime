import { useNavigate } from 'react-router-dom';
import type { DashboardStats } from '@/features/admin/api/adminApi';
import { Users, FileText, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  stats?: DashboardStats;
}

export function QuickActions({ stats }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Quản lý người dùng',
      description: 'Xem và quản lý tài khoản',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/users',
      badge: stats?.banned_users ? `${stats.banned_users} bị khoá` : undefined,
      badgeColor: 'bg-red-50 text-red-600',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Quản lý bài viết',
      description: 'Kiểm duyệt nội dung',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/posts',
      badge: stats?.hidden_posts_count ? `${stats.hidden_posts_count} bị ẩn` : undefined,
      badgeColor: 'bg-amber-50 text-amber-600',
      gradient: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-900">Hành động nhanh</h3>
        <p className="text-xs text-gray-400 mt-0.5">Truy cập nhanh các chức năng</p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group text-left"
          >
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{action.label}</p>
              <p className="text-xs text-gray-400">{action.description}</p>
            </div>
            {action.badge && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${action.badgeColor}`}>
                {action.badge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* Active today */}
      {stats && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Đang hoạt động hôm nay</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold text-emerald-600">{stats.active_users_today}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
