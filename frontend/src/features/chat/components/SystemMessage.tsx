import { Flame, AlertTriangle, HeartCrack, Gift, ShieldCheck, Info } from 'lucide-react';

interface SystemMessageProps {
  content: string;
}

/**
 * Parse streak metadata from system message content.
 * Format: "visible text|||{json metadata}"
 */
function parseStreakMessage(content: string): { text: string; metadata?: Record<string, unknown> } {
  const parts = content.split('|||');
  const text = parts[0];
  let metadata: Record<string, unknown> | undefined;
  if (parts[1]) {
    try {
      metadata = JSON.parse(parts[1]);
    } catch { /* ignore parse errors */ }
  }
  return { text, metadata };
}

/**
 * Detect the type of streak system message from its content.
 */
function getStreakType(text: string): 'milestone' | 'warning' | 'lost' | 'reward' | 'restore_used' | 'generic' {
  if (text.includes('ngày liên tiếp')) return 'milestone';
  if (text.includes('nguy hiểm')) return 'warning';
  if (text.includes('mất chuỗi')) return 'lost';
  if (text.includes('Thưởng')) return 'reward';
  if (text.includes('đã khôi phục chuỗi')) return 'restore_used';
  return 'generic';
}

/**
 * SystemMessage — center-aligned system event message in chat.
 * Hiển thị text thuần và icon thư viện cho tất cả các loại thông báo streak.
 */
export default function SystemMessage({ content }: SystemMessageProps) {
  const { text, metadata } = parseStreakMessage(content);
  const streakType = getStreakType(text);

  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-600';
  let borderColor = 'border-transparent';
  let Icon = Info;

  if (streakType === 'milestone') {
    bgColor = 'bg-indigo-50';
    textColor = 'text-indigo-700';
    borderColor = 'border-indigo-100';
    Icon = Flame;
  } else if (streakType === 'warning') {
    bgColor = 'bg-amber-50';
    textColor = 'text-amber-700';
    borderColor = 'border-amber-100';
    Icon = AlertTriangle;
  } else if (streakType === 'lost') {
    bgColor = 'bg-slate-50';
    textColor = 'text-slate-500';
    borderColor = 'border-slate-200';
    Icon = HeartCrack;
  } else if (streakType === 'reward') {
    bgColor = 'bg-emerald-50';
    textColor = 'text-emerald-700';
    borderColor = 'border-emerald-100';
    Icon = Gift;
  } else if (streakType === 'restore_used') {
    bgColor = 'bg-blue-50';
    textColor = 'text-blue-700';
    borderColor = 'border-blue-100';
    Icon = ShieldCheck;
  }

  return (
    <div className="flex justify-center my-3 px-4">
      <div className={`border rounded-full px-4 py-1.5 flex items-center gap-2 max-w-sm ${bgColor} ${borderColor}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${textColor}`} />
        <span className={`text-[13px] font-medium leading-relaxed ${textColor}`}>
          {text}
        </span>
      </div>
    </div>
  );
}
