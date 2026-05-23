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

class PostService implements PostServiceInterface
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
        protected PostLikeRepositoryInterface $postLikeRepository,
        protected PostCommentRepositoryInterface $postCommentRepository,
        protected UserRepositoryInterface $userRepository,
    ) {}

    public function getFeed(int $userId, ?string $cursor): CursorPaginator
    {
        $posts = $this->postRepository->getFeed(15, $cursor);

        // Append is_liked cho user đang login
        $postIds = collect($posts->items())->pluck('id');
        $likedPostIds = $this->postLikeRepository->getLikedPostIds($userId, $postIds->toArray());

        foreach ($posts->items() as $post) {
            $post->is_liked = in_array($post->id, $likedPostIds);
        }

        return $posts;
    }

    public function getPostById(int $postId, int $userId): Model
    {
        $post = $this->postRepository->findOrFail($postId);
        $post->load(['user', 'media']);
        $post->is_liked = (bool) $this->postLikeRepository->findByPostAndUser($postId, $userId);
        return $post;
    }

    public function getUserPosts(int $userId, int $viewerId): LengthAwarePaginator
    {
        $posts = $this->postRepository->getUserPosts($userId, $viewerId);

        // Append is_liked cho user đang xem (viewerId)
        $postIds = collect($posts->items())->pluck('id')->toArray();
        $likedPostIds = $this->postLikeRepository->getLikedPostIds($viewerId, $postIds);

        foreach ($posts->items() as $post) {
            $post->is_liked = in_array($post->id, $likedPostIds);
        }

        return $posts;
    }

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

    public function toggleLike(int $postId, int $userId): array
    {
        $post = $this->postRepository->findOrFail($postId);
        $existing = $this->postLikeRepository->findByPostAndUser($postId, $userId);

        if ($existing) {
            $this->postLikeRepository->deleteByPostAndUser($postId, $userId);
            $post->decrement('likes_count');
            return ['liked' => false, 'likes_count' => $post->fresh()->likes_count];
        }

        $this->postLikeRepository->create([
            'post_id' => $postId,
            'user_id' => $userId,
        ]);
        $post->increment('likes_count');

        return ['liked' => true, 'likes_count' => $post->fresh()->likes_count];
    }

    public function getComments(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        // Kiểm tra bài viết tồn tại
        $this->postRepository->findOrFail($postId);
        return $this->postCommentRepository->getByPostId($postId, $perPage);
    }

    public function createComment(int $postId, int $userId, array $data): Model
    {
        $post = $this->postRepository->findOrFail($postId);

        // Giới hạn tối đa 2 cấp lồng: nếu trả lời của trả lời => gắn vào bình luận gốc
        $parentId = $data['parent_id'] ?? null;
        if ($parentId) {
            $parent = $this->postCommentRepository->findOrFail($parentId);
            if ($parent->parent_id !== null) {
                // Đây là trả lời của trả lời => chuyển hướng về bình luận gốc
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

        $comment->delete(); // DB cascade deletes all child replies
        $post->decrement('comments_count', 1 + $repliesCount);
    }
}
