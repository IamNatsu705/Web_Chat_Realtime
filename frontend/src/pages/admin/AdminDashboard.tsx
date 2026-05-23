import { useDashboardStats } from '@/features/admin/hooks/useDashboardStats';
import { WelcomeSection } from '@/features/admin/components/dashboard/WelcomeSection';
import { DashboardGrid } from '@/features/admin/components/dashboard/DashboardGrid';
import { ActivityChart } from '@/features/admin/components/dashboard/ActivityChart';
import { QuickActions } from '@/features/admin/components/dashboard/QuickActions';
import { TopEngagementPosts } from '@/features/admin/components/dashboard/TopEngagementPosts';
import { MostActiveUsers } from '@/features/admin/components/dashboard/MostActiveUsers';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <WelcomeSection stats={stats} />

      {/* Stats Grid — 4 cards */}
      <DashboardGrid stats={stats} />

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ActivityChart dailyStats={stats?.daily_stats} />
        </div>
        <div>
          <QuickActions stats={stats} />
        </div>
      </div>

      {/* Top Engagement + Most Active */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopEngagementPosts posts={stats?.top_posts} />
        <MostActiveUsers users={stats?.most_active_users} />
      </div>
    </div>
  );
}
