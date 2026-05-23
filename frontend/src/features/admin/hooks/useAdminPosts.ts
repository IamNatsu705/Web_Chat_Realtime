import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { Post } from '@/features/post/types';
import { ADMIN_QUERIES } from './queries';

export function useAdminPosts() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ADMIN_QUERIES.posts(page, statusFilter, search),
    queryFn: async () => {
      const res = await adminApi.getPosts(page, statusFilter || undefined, search || undefined);
      return res.data;
    },
    staleTime: 2 * 60_000,
  });

  const hideMutation = useMutation({
    mutationFn: ({ postId, reason }: { postId: number; reason: string }) =>
      adminApi.hidePost(postId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERIES.postsAll() }),
  });

  const restoreMutation = useMutation({
    mutationFn: (postId: number) => adminApi.restorePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERIES.postsAll() }),
  });

  return {
    // State
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    selectedPost,
    setSelectedPost,
    // Queries
    data,
    isLoading,
    // Mutations
    hideMutation,
    restoreMutation,
  };
}
