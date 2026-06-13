<?php

namespace App\Services\Post;

use App\Repositories\PostCommentRepo\PostCommentRepositoryInterface;
use App\Repositories\PostLikeRepo\PostLikeRepositoryInterface;
use App\Repositories\PostRepo\PostRepositoryInterface;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Exception;

/**
 * Service Bài đăng (Post Service).
 *
 * Xử lý toàn bộ nghiệp vụ liên quan đến bài đăng trên mạng xã hội nội bộ:
 * - Bảng tin (feed) với trạng thái is_liked.
 * - CRUD bài viết (tạo, sửa, xóa) kèm upload media.
 * - Lượt thích (toggle like/unlike).
 * - Bình luận đa cấp (tối đa 2 cấp lồng).
 */
class PostService implements PostServiceInterface
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
        protected PostLikeRepositoryInterface $postLikeRepository,
        protected PostCommentRepositoryInterface $postCommentRepository,
        protected UserRepositoryInterface $userRepository,
    ) {}

    /**
     * Lấy bảng tin (feed) và gắn thêm trạng thái is_liked cho từng bài viết.
     * Tối ưu: lấy danh sách post IDs rồi query 1 lần để kiểm tra liked (tránh N+1).
     */
    public function getFeed(int $userId, ?string $cursor): CursorPaginator
    {
        $posts = $this->postRepository->getFeed(15, $cursor);

        // Gắn trạng thái is_liked cho người dùng đang đăng nhập
        $postIds = collect($posts->items())->pluck('id');
        $likedPostIds = $this->postLikeRepository->getLikedPostIds($userId, $postIds->toArray());

        foreach ($posts->items() as $post) {
            $post->is_liked = in_array($post->id, $likedPostIds);
        }

        return $posts;
    }

    /**
     * Lấy chi tiết bài đăng kèm trạng thái is_liked của người xem.
     */
    public function getPostById(int $postId, int $userId): Model
    {
        $post = $this->postRepository->findOrFail($postId);
        $post->load(['user', 'media']);
        $post->is_liked = (bool) $this->postLikeRepository->findByPostAndUser($postId, $userId);
        return $post;
    }

    /**
     * Lấy bài viết của một người dùng (trang cá nhân), gắn trạng thái is_liked.
     */
    public function getUserPosts(int $userId, int $viewerId): LengthAwarePaginator
    {
        $posts = $this->postRepository->getUserPosts($userId, $viewerId);

        // Gắn trạng thái is_liked cho người đang xem (viewerId)
        $postIds = collect($posts->items())->pluck('id')->toArray();
        $likedPostIds = $this->postLikeRepository->getLikedPostIds($viewerId, $postIds);

        foreach ($posts->items() as $post) {
            $post->is_liked = in_array($post->id, $likedPostIds);
        }

        return $posts;
    }

    /**
     * Tạo bài đăng mới.
     * Hỗ trợ đính kèm nhiều file media (ảnh/video), phân biệt loại dựa trên MIME type.
     */
    public function createPost(int $userId, array $data): Model
    {
        $post = $this->postRepository->create([
            'user_id' => $userId,
            'content' => $data['content'],
        ]);

        // Xử lý upload ảnh/video đính kèm
        if (!empty($data['media'])) {
            $files = is_array($data['media']) ? $data['media'] : [$data['media']];
            foreach ($files as $index => $file) {
                $path = $file->store('posts', 'public');
                $post->media()->create([
                    'media_url' => $path,
                    'media_type' => str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image',
                    'sort_order' => $index,
                ]);
            }
        }

        $post->load(['user', 'media']);
        return $post;
    }

    /**
     * Cập nhật nội dung bài đăng — chỉ chủ bài viết mới được sửa.
     */
    public function updatePost(int $postId, int $userId, array $data): Model
    {
        $post = $this->postRepository->findOrFail($postId);

        if ($post->user_id !== $userId) {
            throw new Exception('Bạn không có quyền sửa bài viết này.');
        }

        $post->update(['content' => $data['content']]);
        $post->load(['user', 'media']);
        return $post;
    }

    /**
     * Xóa bài đăng — chủ bài viết hoặc admin mới được xóa.
     * Xóa kèm file media trên storage.
     */
    public function deletePost(int $postId, int $userId): void
    {
        $post = $this->postRepository->findOrFail($postId);
        $user = $this->userRepository->findOrFail($userId);

        if ($post->user_id !== $userId && !$user->isAdmin()) {
            throw new Exception('Bạn không có quyền xoá bài viết này.');
        }

        // Xóa file media khỏi bộ nhớ lưu trữ
        foreach ($post->media as $media) {
            Storage::disk('public')->delete($media->media_url);
        }

        $post->delete();
    }

    /**
     * Toggle thích/bỏ thích bài đăng.
     * Trả về trạng thái mới (liked) và số lượt thích hiện tại (likes_count).
     */
    public function toggleLike(int $postId, int $userId): array
    {
        $post = $this->postRepository->findOrFail($postId);
        $existing = $this->postLikeRepository->findByPostAndUser($postId, $userId);

        if ($existing) {
            // Đã thích → bỏ thích
            $this->postLikeRepository->deleteByPostAndUser($postId, $userId);
            $post->decrement('likes_count');
            return ['liked' => false, 'likes_count' => $post->fresh()->likes_count];
        }

        // Chưa thích → thích (dùng firstOrCreate để tránh lỗi race condition khi click đúp)
        $this->postLikeRepository->firstOrCreate([
            'post_id' => $postId,
            'user_id' => $userId,
        ]);
        $post->increment('likes_count');

        return ['liked' => true, 'likes_count' => $post->fresh()->likes_count];
    }

    /**
     * Lấy danh sách bình luận gốc (cấp 1) kèm replies.
     */
    public function getComments(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        // Kiểm tra bài viết tồn tại trước khi query comments
        $this->postRepository->findOrFail($postId);
        return $this->postCommentRepository->getByPostId($postId, $perPage);
    }

    /**
     * Tạo bình luận mới.
     * Giới hạn tối đa 2 cấp lồng: nếu trả lời của trả lời → gắn vào bình luận gốc.
     */
    public function createComment(int $postId, int $userId, array $data): Model
    {
        $post = $this->postRepository->findOrFail($postId);

        // Giới hạn tối đa 2 cấp lồng: nếu trả lời của trả lời → gắn vào bình luận gốc
        $parentId = $data['parent_id'] ?? null;
        if ($parentId) {
            $parent = $this->postCommentRepository->findOrFail($parentId);
            if ($parent->parent_id !== null) {
                // Đây là trả lời của trả lời → chuyển hướng về bình luận gốc
                $parentId = $parent->parent_id;
            }
        }

        $comment = $this->postCommentRepository->create([
            'post_id' => $postId,
            'user_id' => $userId,
            'parent_id' => $parentId,
            'content' => $data['content'],
        ]);

        $post->increment('comments_count');
        $comment->load('user');

        return $comment;
    }

    /**
     * Cập nhật nội dung bình luận — chỉ chủ bình luận mới được sửa.
     */
    public function updateComment(int $commentId, int $userId, array $data): Model
    {
        $comment = $this->postCommentRepository->findOrFail($commentId);

        if ($comment->user_id !== $userId) {
            throw new Exception('Bạn không có quyền sửa bình luận này.');
        }

        $comment->update(['content' => $data['content']]);
        $comment->load('user');
        return $comment;
    }

    /**
     * Xóa bình luận — cho phép: chủ bình luận, chủ bài viết, hoặc admin.
     * Xóa kèm tất cả replies con (cascade) và giảm comments_count tương ứng.
     */
    public function deleteComment(int $commentId, int $userId): void
    {
        $comment = $this->postCommentRepository->findOrFail($commentId);
        $post = $this->postRepository->findOrFail($comment->post_id);
        $user = $this->userRepository->findOrFail($userId);

        // Cho phép: chủ bình luận, chủ bài viết, hoặc admin
        if ($comment->user_id !== $userId && $post->user_id !== $userId && !$user->isAdmin()) {
            throw new Exception('Bạn không có quyền xoá bình luận này.');
        }

        // Đếm số trả lời con sẽ bị xóa theo (cascade)
        $repliesCount = $comment->replies()->count();

        $comment->delete(); // DB cascade xóa tất cả reply con
        $post->decrement('comments_count', 1 + $repliesCount);
    }
}
