import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { postApi } from '../api/postApi';
import type { Post, FeedPage } from '../types';

export const POST_QUERIES = {
  feed: () => ['feed'],
  post: (id: number) => ['post', id],
  comments: (postId: number) => ['post', postId, 'comments'],
  userPosts: (userId: number) => ['user', userId, 'posts'],
};

/**
 * Feed với cursor-based infinite scrolling
 */
export function useFeedQuery() {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery<FeedPage>({
    queryKey: POST_QUERIES.feed(),
    queryFn: async ({ pageParam }) => {
      const res = await postApi.getFeed(pageParam as string | null);
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: isAuthenticated,
    staleTime: 2 * 60_000, // 2 phút
  });
}

/**
 * Lấy bài viết của một user cụ thể
 */
export function useUserPostsQuery(userId: number | null) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: POST_QUERIES.userPosts(userId!),
    queryFn: async () => {
      const res = await postApi.getUserPosts(userId!);
      return res.data;
    },
    enabled: isAuthenticated && userId !== null,
    staleTime: 2 * 60_000,
  });
}

/**
 * Mutation: Đăng bài mới
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, media }: { content: string; media?: File[] }) =>
      postApi.createPost(content, media),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POST_QUERIES.feed() });
      // Cũng invalidate user posts nếu đang xem profile mình
      queryClient.invalidateQueries({ queryKey: ['user'], exact: false });
    },
  });
}

// ── Helper: Optimistic update cho cả feed và userPosts ──────────────────────

interface InfiniteFeedData {
  pages: FeedPage[];
  pageParams: (string | null)[];
}

interface UserPostsData {
  posts: Post[];
  current_page: number;
  last_page: number;
}

function optimisticUpdatePost(queryClient: ReturnType<typeof useQueryClient>, postId: number, updater: (post: Post) => Post) {
  // Update trong feed (infinite query)
  queryClient.setQueriesData<InfiniteFeedData>(
    { queryKey: POST_QUERIES.feed() },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) => p.id === postId ? updater(p) : p),
        })),
      };
    }
  );

  // Update trong tất cả userPosts queries
  queryClient.setQueriesData<UserPostsData>(
    {
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.length === 3 && key[0] === 'user' && key[2] === 'posts';
      },
    },
    (old) => {
      if (!old?.posts) return old;
      return {
        ...old,
        posts: old.posts.map((p) => p.id === postId ? updater(p) : p),
      };
    }
  );
}

/**
 * Mutation: Toggle like — Optimistic Update
 */
export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postApi.toggleLike(postId),
    onMutate: async (postId) => {
      // Cancel cả feed lẫn userPosts để tránh race condition
      await queryClient.cancelQueries({ queryKey: POST_QUERIES.feed() });
      await queryClient.cancelQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length === 3 && key[0] === 'user' && key[2] === 'posts';
        },
      });

      // Snapshot để rollback nếu lỗi
      const previousFeed = queryClient.getQueryData(POST_QUERIES.feed());
      const previousUserPostsEntries = queryClient.getQueriesData({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length === 3 && key[0] === 'user' && key[2] === 'posts';
        },
      });

      // Optimistic update cho cả hai
      optimisticUpdatePost(queryClient, postId, (p) => ({
        ...p,
        is_liked: !p.is_liked,
        likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
      }));

      return { previousFeed, previousUserPostsEntries };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(POST_QUERIES.feed(), context.previousFeed);
      }
      if (context?.previousUserPostsEntries) {
        for (const [queryKey, data] of context.previousUserPostsEntries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
  });
}


/**
 * Query: Lấy comments của post
 */
export function useCommentsQuery(postId: number | null) {
  return useQuery({
    queryKey: POST_QUERIES.comments(postId!),
    queryFn: async () => {
      const res = await postApi.getComments(postId!);
      return res.data;
    },
    enabled: postId !== null,
    staleTime: 60_000, // 1 phút
  });
}

/**
 * Mutation: Thêm comment mới
 */
export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      content,
      parentId,
    }: {
      postId: number;
      content: string;
      parentId?: number;
    }) => postApi.createComment(postId, content, parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: POST_QUERIES.comments(variables.postId),
      });
      // Cập nhật comments_count trong cả feed và userPosts
      optimisticUpdatePost(queryClient, variables.postId, (p) => ({
        ...p,
        comments_count: p.comments_count + 1,
      }));
    },
  });
}

/**
 * Mutation: Xoá bài viết
 */
export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POST_QUERIES.feed() });
      queryClient.invalidateQueries({ queryKey: ['user'], exact: false });
    },
  });
}

/**
 * Mutation: Xoá comment (cascade deletes replies via BE)
 */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: number; postId: number }) =>
      postApi.deleteComment(commentId),
    onSuccess: (_data, variables) => {
      // Invalidate comments to refetch fresh list
      queryClient.invalidateQueries({
        queryKey: POST_QUERIES.comments(variables.postId),
      });
      // Also invalidate feed + userPosts to sync comments_count
      queryClient.invalidateQueries({ queryKey: POST_QUERIES.feed() });
      queryClient.invalidateQueries({ queryKey: ['user'], exact: false });
    },
  });
}

