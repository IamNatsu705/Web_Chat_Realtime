import { useAuth } from '@/providers/AuthProvider';
import type { DashboardStats } from '@/features/admin/api/adminApi';

interface WelcomeSectionProps {
  stats?: DashboardStats;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function formatDate(): string {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function WelcomeSection({ stats }: WelcomeSectionProps) {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <p className="text-gray-500 text-sm font-medium mb-1">{formatDate()}</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {getGreeting()}, {user?.name}
      </h1>
      <p className="text-gray-500 text-sm max-w-2xl">
        {stats ? (
          <>
            Trong 7 ngày qua, hệ thống có thêm <span className="font-semibold text-gray-700">{stats.new_posts_week}</span> bài viết
            và <span className="font-semibold text-gray-700">{stats.new_users_week}</span> người dùng mới.
            {stats.active_users_today > 0 && (
              <> Hôm nay có <span className="font-semibold text-emerald-600">{stats.active_users_today}</span> người đang hoạt động.</>
            )}
          </>
        ) : (
          'Đang tải dữ liệu...'
        )}
      </p>
    </div>
  );
}
