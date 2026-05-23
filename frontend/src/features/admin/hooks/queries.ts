import { useQuery } from '@tanstack/react-query';
import { adminApi, type DashboardStats } from '../api/adminApi';

// ─── Centralized Admin Query Keys ────────────────────────────────────────────

export const ADMIN_QUERIES = {
  dashboard: () => ['admin', 'dashboard'] as const,
  users: (page?: number, search?: string, status?: string) => ['admin', 'users', page, search, status] as const,
  usersAll: () => ['admin', 'users'] as const,
  posts: (page?: number, status?: string, search?: string) => ['admin', 'posts', page, status, search] as const,
  postsAll: () => ['admin', 'posts'] as const,
};

// ─── Dashboard Query ──────────────────────────────────────────────────────────

export function useDashboardStatsQuery() {
  return useQuery<DashboardStats>({
    queryKey: ADMIN_QUERIES.dashboard(),
    queryFn: async () => {
      const res = await adminApi.getDashboard();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}
