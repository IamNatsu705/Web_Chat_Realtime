import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '@/features/admin/api/adminApi';

interface ActivityChartProps {
  dailyStats?: DashboardStats['daily_stats'];
}

type TabType = 'users' | 'posts' | 'messages';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 min-w-[140px]">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-600">{entry.name}</span>
          </div>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ActivityChart({ dailyStats }: ActivityChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Biểu đồ hoạt động</h3>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Chưa có dữ liệu
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; color: string; gradient: string }[] = [
    { id: 'posts', label: 'Bài viết', color: '#10b981', gradient: 'url(#gradPosts)' },
    { id: 'messages', label: 'Tin nhắn', color: '#f59e0b', gradient: 'url(#gradMessages)' },
    { id: 'users', label: 'Người dùng', color: '#6366f1', gradient: 'url(#gradUsers)' },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Biểu đồ hoạt động</h3>
          <p className="text-xs text-gray-400 mt-0.5">Thống kê 7 ngày qua</p>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center bg-gray-50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={activeTab}
            name={activeTabData.label}
            stroke={activeTabData.color}
            fill={activeTabData.gradient}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: activeTabData.color }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
