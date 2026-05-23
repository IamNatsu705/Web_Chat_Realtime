import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
  trend?: number;
  trendLabel?: string;
  sparkData?: number[];
}

function TrendBadge({ trend, label }: { trend: number; label?: string }) {
  const isPositive = trend > 0;
  const isZero = trend === 0;

  return (
    <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      isZero ? 'bg-gray-100 text-gray-500' :
      isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
    }`}>
      {isZero ? (
        <Minus className="w-3 h-3" />
      ) : isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      <span>{isZero ? '0%' : `${isPositive ? '+' : ''}${trend.toFixed(0)}%`}</span>
      {label && <span className="text-gray-400 font-normal ml-0.5">{label}</span>}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-[3px] mt-3 h-8">
      {data.map((val, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-60 hover:opacity-100 transition-opacity duration-150`}
          style={{ height: `${Math.max((val / max) * 100, 8)}%` }}
          title={`${val}`}
        />
      ))}
    </div>
  );
}

export function StatCard({ label, value, icon, gradient, textColor, trend, trendLabel, sparkData }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend !== undefined && <TrendBadge trend={trend} label={trendLabel} />}
        </div>
        <div className={`h-11 w-11 rounded-xl ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
          <div className={textColor}>{icon}</div>
        </div>
      </div>
      {sparkData && <Sparkline data={sparkData} color={gradient.replace('bg-', 'bg-').replace('-50', '-300')} />}
    </div>
  );
}
