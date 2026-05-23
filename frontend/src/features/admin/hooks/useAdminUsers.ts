import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { ADMIN_QUERIES } from './queries';

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [banModal, setBanModal] = useState<{ userId: number; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ADMIN_QUERIES.users(page, search, status !== 'all' ? status : undefined),
    queryFn: async () => {
      const res = await adminApi.getUsers(page, search || undefined, status !== 'all' ? status : undefined);
      return res.data;
    },
    staleTime: 2 * 60_000,
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) =>
      adminApi.banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERIES.usersAll() });
      setBanModal(null);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: number) => adminApi.unbanUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERIES.usersAll() }),
  });

  return {
    // State
    search,
    setSearch,
    page,
    setPage,
    status,
    setStatus,
    banModal,
    setBanModal,
    // Queries
    data,
    isLoading,
    // Mutations
    banMutation,
    unbanMutation,
  };
}
