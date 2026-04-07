<?php

namespace App\Repositories\FriendShipRepo;

use App\Models\FriendShip;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Support\Collection;

class FriendShipRepository extends BaseRepository implements FriendShipRepositoryInterface
{
    public function getModel(): string
    {
        return FriendShip::class;
    }

    public function checkIsFriend(int $userId, int $friendId)
    {
        return $this->model->where(function ($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->first();
    }

    public function getFriendsByUserId(int $userId): Collection
    {
        return $this->model
            ->with(['user', 'friend'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function deleteFriendship(int $userId, int $friendId): bool
    {
        $deleted = $this->model->where(function ($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->delete();

        return $deleted > 0;
    }
}
