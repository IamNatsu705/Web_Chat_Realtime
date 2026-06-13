<?php

namespace App\Repositories\PostLikeRepo;

use App\Models\PostLike;
use App\Repositories\BaseRepo\BaseRepository;

/**
 * Repository Lượt thích bài đăng (Post Like Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng post_likes.
 */
class PostLikeRepository extends BaseRepository implements PostLikeRepositoryInterface
{
    public function getModel(): string
    {
        return PostLike::class;
    }

    /** {@inheritdoc} */
    public function findByPostAndUser(int $postId, int $userId)
    {
        return $this->model
            ->where('post_id', $postId)
            ->where('user_id', $userId)
            ->first();
    }

    /** {@inheritdoc} */
    public function deleteByPostAndUser(int $postId, int $userId): bool
    {
        return (bool) $this->model
            ->where('post_id', $postId)
            ->where('user_id', $userId)
            ->delete();
    }

    /** {@inheritdoc} */
    public function getLikedPostIds(int $userId, array $postIds): array
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->toArray();
    }
}
