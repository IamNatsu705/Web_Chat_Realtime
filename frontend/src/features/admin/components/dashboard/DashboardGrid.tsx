import type { DashboardStats } from '@/features/admin/api/adminApi';
import { StatCard } from './StatCard';
import { Users, FileText, MessageSquare, Ban } from 'lucide-react';

interface DashboardGridProps {
  stats?: DashboardStats;
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function DashboardGrid({ stats }: DashboardGridProps) {
  if (!stats) return null;

  const usersTrend = calcTrend(stats.new_users_week, stats.prev_users_week);
  const postsTrend = calcTrend(stats.new_posts_week, stats.prev_posts_week);

  // Extract sparkline data from daily_stats
  const usersSparkData = stats.daily_stats?.map(d => d.users) || [];
  const postsSparkData = stats.daily_stats?.map(d => d.posts) || [];
  const messagesSparkData = stats.daily_stats?.map(d => d.messages) || [];

  const cards = [
    {
      label: 'Tổng người dùng',
      value: stats.total_users,
      icon: <Users className="w-5 h-5" />,
      gradient: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      trend: usersTrend,
      trendLabel: 'vs tuần trước',
      sparkData: usersSparkData,
    },
    {
      label: 'Tổng bài viết',
      value: stats.total_posts,
      icon: <FileText className="w-5 h-5" />,
      gradient: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: postsTrend,
      trendLabel: 'vs tuần trước',
      sparkData: postsSparkData,
    },
    {
      label: 'Tổng tin nhắn',
      value: stats.total_messages,
      icon: <MessageSquare className="w-5 h-5" />,
      gradient: 'bg-amber-50',
      textColor: 'text-amber-600',
      sparkData: messagesSparkData,
    },
    {
      label: 'Tài khoản bị khoá',
      value: stats.banned_users,
      icon: <Ban className="w-5 h-5" />,
      gradient: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
