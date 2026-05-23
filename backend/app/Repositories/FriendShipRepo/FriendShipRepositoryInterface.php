<?php

namespace App\Repositories\FriendshipRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Support\Collection;

interface FriendshipRepositoryInterface extends BaseRepositoryInterface
{
    public function checkIsFriend(int $userId, int $friendId);

    public function getFriendsByUserId(int $userId): Collection;

    public function deleteFriendship(int $userId, int $friendId): bool;

    /**
     * Lấy tất cả friend IDs của user (1 query nhẹ, indexed).
     *
     * @return int[]
     */
    public function getFriendIds(int $userId): array;

    /**
     * Gợi ý kết bạn dựa trên bạn chung (mutual friends).
     * Tối ưu: 2-step approach, không dùng correlated subquery.
     */
    public function getSuggestedFriends(int $userId, array $friendIds, array $excludeIds = [], int $limit = 10): Collection;

    public function getFriendshipStatus(int $userId, int $friendId);
}
