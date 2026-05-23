import { useState, useEffect, useRef, useCallback } from 'react';
import { chatApi } from '../api/chatApi';
import type { StreakData } from '../types';
import type { User } from '../../auth/types';
import {
  BsFire,
  BsShieldFillCheck,
  BsShareFill,
} from 'react-icons/bs';
import {
  FaSeedling,
  FaStar,
  FaGem,
  FaTrophy,
  FaCrown,
  FaFireFlameCurved,
} from 'react-icons/fa6';
import { HiXMark } from 'react-icons/hi2';

interface StreakInfoPanelProps {
  conversationId: number;
  streakPreview: StreakData;
  currentUser: User;
  otherUser: User | null | undefined;
  onClose: () => void;
}

const MILESTONES = [5, 10, 15, 30, 50, 100] as const;

const TIER_MAPPING: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  streak_5: { label: 'Khởi đầu', icon: <FaSeedling />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  streak_10: { label: 'Thân thiết', icon: <FaStar />, color: 'text-amber-500', bg: 'bg-amber-50' },
  streak_15: { label: 'Chuyên cần', icon: <FaGem />, color: 'text-blue-500', bg: 'bg-blue-50' },
  streak_30: { label: 'Tri kỷ', icon: <FaTrophy />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  streak_50: { label: 'Huyền thoại', icon: <FaCrown />, color: 'text-purple-600', bg: 'bg-purple-50' },
  streak_100: { label: 'Bất diệt', icon: <FaFireFlameCurved />, color: 'text-red-500', bg: 'bg-red-50' },
};

export default function StreakInfoPanel({
  conversationId,
  streakPreview,
  currentUser,
  otherUser,
  onClose,
}: StreakInfoPanelProps) {
  const [streak, setStreak] = useState<StreakData>(streakPreview);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restored, setRestored] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch enriched streak data from API (has user_messaged_today, next_milestone, etc.)
  const fetchStreak = useCallback(async () => {
    try {
      const res = await chatApi.getStreak(conversationId);
      if (res.data?.streak) {
        setStreak(res.data.streak);
      }
    } catch (err) {
      console.error('Failed to load streak details:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Initial fetch
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Re-fetch when WebSocket StreakUpdated event arrives for this conversation
  useEffect(() => {
    const handleStreakUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.conversationId === conversationId) {
        fetchStreak();
      }
    };
    window.addEventListener('streak-updated', handleStreakUpdated);
    return () => window.removeEventListener('streak-updated', handleStreakUpdated);
  }, [conversationId, fetchStreak]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleShare = async () => {
    if (sharing || shared) return;
    setSharing(true);
    try {
      await chatApi.shareStreak(conversationId);
      setShared(true);
    } catch (err) {
      console.error('Share streak failed:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleRestore = async () => {
    if (restoring || restored) return;
    setRestoring(true);
    try {
      const res = await chatApi.restoreStreak(conversationId);
      setRestored(true);
      if (res.data) {
        setStreak((prev) => ({
          ...prev,
          status: (res.data as { status: string }).status as StreakData['status'],
          restore_days: (res.data as { restore_days: number }).restore_days,
        }));
      }
    } catch (err) {
      console.error('Restore streak failed:', err);
    } finally {
      setRestoring(false);
    }
  };

  const current = streak.current_streak;
  const tierInfo = TIER_MAPPING[streak.tier] ?? {
    label: 'Mới bắt đầu',
    icon: <FaSeedling />,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  };

  let progressPercent = 0;
  if (streak.next_milestone) {
    const nextVal = streak.next_milestone;
    const currentIndex = MILESTONES.indexOf(nextVal as typeof MILESTONES[number]);
    const prevVal = currentIndex > 0 ? MILESTONES[currentIndex - 1] : 0;
    const range = nextVal - prevVal;
    const progressInRange = current - prevVal;
    progressPercent = Math.max(0, Math.min(100, (progressInRange / range) * 100));
  }



  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-left"
      style={{ animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* Header section - Clean & elegant */}
      <div className="p-5 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 text-orange-500">
            <BsFire className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Chuỗi Trò Chuyện</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded-full transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{current}</span>
            <span className="text-sm font-medium text-gray-500">ngày</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${tierInfo.bg} ${tierInfo.color}`}>
            {tierInfo.icon}
            <span className="text-sm font-bold">{tierInfo.label}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Progress & Milestones */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-semibold text-gray-500">Mốc thành tựu</p>
            {streak.next_milestone && (
              <span className="text-xs font-bold text-gray-900">
                {current} / <span className="text-gray-500">{streak.next_milestone}</span>
              </span>
            )}
          </div>

          {streak.next_milestone && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-6 gap-1">
            {MILESTONES.map((m) => {
              const reached = current >= m;
              const isNext = streak.next_milestone === m;
              return (
                <div
                  key={m}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-lg border transition-colors ${
                    reached
                      ? 'bg-orange-50 border-orange-200 text-orange-600'
                      : isNext
                      ? 'bg-white border-orange-300 text-orange-500 shadow-sm'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-xs font-bold">{m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restore Info & Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <BsShieldFillCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Quyền khôi phục</p>
              <p className="text-xs text-gray-500">Reset 3 lượt mỗi 30 ngày</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">{streak.restore_days}</span>
              <span className="text-xs text-gray-500 font-medium">/3</span>
            </div>
          </div>

          {/* Share button: chỉ hiện đúng ngày đạt mốc (last_completed_date = today) */}
          {streak.is_milestone && current >= 5 && streak.today_completed && (
            <button
              onClick={handleShare}
              disabled={sharing || shared}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                shared
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {shared ? (
                <>✅ Đã chia sẻ thành công</>
              ) : (
                <><BsShareFill className="w-4 h-4" /> {sharing ? 'Đang xử lý...' : 'Chia sẻ thành tựu'}</>
              )}
            </button>
          )}

          {streak.status === 'pending_restore' && streak.restore_days > 0 && (
            <button
              onClick={handleRestore}
              disabled={restoring || restored}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                restored
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {restored ? (
                <>✅ Đã khôi phục thành công</>
              ) : (
                <><BsShieldFillCheck className="w-4 h-4" /> {restoring ? 'Đang xử lý...' : `Khôi phục chuỗi (${streak.restore_days})`}</>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
