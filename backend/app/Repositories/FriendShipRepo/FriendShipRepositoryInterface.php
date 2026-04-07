<?php

namespace App\Repositories\FriendShipRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Support\Collection;

interface FriendShipRepositoryInterface extends BaseRepositoryInterface
{
    public function checkIsFriend(int $userId, int $friendId);

    public function getFriendsByUserId(int $userId): Collection;

    public function deleteFriendship(int $userId, int $friendId): bool;
}
