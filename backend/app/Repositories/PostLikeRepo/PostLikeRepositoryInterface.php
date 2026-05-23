<?php

namespace App\Repositories\PostLikeRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface PostLikeRepositoryInterface extends BaseRepositoryInterface
{
    public function findByPostAndUser(int $postId, int $userId);

    public function deleteByPostAndUser(int $postId, int $userId): bool;

    public function getLikedPostIds(int $userId, array $postIds): array;
}
