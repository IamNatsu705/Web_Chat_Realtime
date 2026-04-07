<?php

namespace App\Repositories\UserRepo;

use App\Models\User;
use App\Repositories\BaseRepo\BaseRepository;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function getModel()
    {
        return User::class;
    }

    public function findByEmail(string $email)
    {
        return $this->findByField('email', $email);
    }

    public function searchByKeyword(string $keyword, int $currentUserId)
    {
        return $this->model
            ->select('users.id', 'users.name', 'users.email', 'users.avatar')
            // 1. Join với FriendRequest (Giữ nguyên logic orOn của bạn)
            ->leftJoin('friend_requests', function ($join) use ($currentUserId) {
                $join->on(function ($q) use ($currentUserId) {
                    $q->on('friend_requests.sender_id', '=', DB::raw($currentUserId))
                        ->on('friend_requests.receiver_id', '=', 'users.id');
                })->orOn(function ($q) use ($currentUserId) {
                    $q->on('friend_requests.receiver_id', '=', DB::raw($currentUserId))
                        ->on('friend_requests.sender_id', '=', 'users.id');
                });
            })
            // 2. Sửa lại Join với Friendships để kiểm tra cả 2 chiều
            ->leftJoin('friendships', function ($join) use ($currentUserId) {
                $join->on(function ($q) use ($currentUserId) {
                    $q->on('friendships.user_id', '=', DB::raw($currentUserId))
                        ->on('friendships.friend_id', '=', 'users.id');
                })->orOn(function ($q) use ($currentUserId) {
                    $q->on('friendships.friend_id', '=', DB::raw($currentUserId))
                        ->on('friendships.user_id', '=', 'users.id');
                });
            })
            ->addSelect([
                DB::raw("CASE
                WHEN friendships.id IS NOT NULL THEN 'accepted'
                WHEN friend_requests.id IS NOT NULL THEN friend_requests.status
                ELSE 'none'
            END as relationship_status"),

                'friend_requests.id as friend_request_id',

                DB::raw("CASE
                WHEN friend_requests.sender_id = $currentUserId THEN 1
                ELSE 0
            END as is_sender")
            ])
            ->where(function ($query) use ($keyword) {
                $query->where('users.name', 'LIKE', '%' . $keyword . '%')
                    ->orWhere('users.email', $keyword);
            })
            ->where('users.id', '!=', $currentUserId)
            // GroupBy cần bao quát hết các trường để tránh lỗi SQL Strict Mode
            ->groupBy(
                'users.id',
                'users.name',
                'users.email',
                'users.avatar',
                'friendships.id',
                'friend_requests.id',
                'friend_requests.status',
                'friend_requests.sender_id'
            )
            ->get();
    }
}
