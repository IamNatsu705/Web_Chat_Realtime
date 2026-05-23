<?php

namespace App\Repositories\FriendshipRepo;

use App\Models\Friendship;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FriendshipRepository extends BaseRepository implements FriendshipRepositoryInterface
{
    public function getModel(): string
    {
        return Friendship::class;
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

    /**
     * Lấy tất cả friend IDs của user (1 query nhẹ, indexed).
     *
     * @return int[]
     */
    public function getFriendIds(int $userId): array
    {
        $asUser = $this->model
            ->where('user_id', $userId)
            ->pluck('friend_id');

        $asFriend = $this->model
            ->where('friend_id', $userId)
            ->pluck('user_id');

        return $asUser->merge($asFriend)->unique()->values()->all();
    }

    /**
     * Gợi ý kết bạn dựa trên bạn chung (mutual friends).
     *
     * ╔══════════════════════════════════════════════════════════════════════╗
     * ║  GIẢI THUẬT TỐI ƯU (2-step, không correlated subquery):           ║
     * ║                                                                    ║
     * ║  B1: Gọi getFriendIds() lấy danh sách friend_ids (đã indexed)     ║
     * ║  B2: Query friendships WHERE user_id IN (friend_ids)               ║
     * ║      → Tìm friend-of-friend (không phải chính mình, chưa kết bạn) ║
     * ║      → GROUP BY + COUNT → đếm mutual friends                      ║
     * ║      → ORDER BY mutual_count DESC → sắp xếp theo số bạn chung    ║
     * ║                                                                    ║
     * ║  Complexity: O(F) cho B1 + O(F*avg_friends) cho B2                ║
     * ║  So với correlated subquery: O(N*F) với N=total users              ║
     * ╚══════════════════════════════════════════════════════════════════════╝
     */
    public function getSuggestedFriends(int $userId, array $friendIds, array $excludeIds = [], int $limit = 10): Collection
    {
        if (empty($friendIds)) {
            return collect();
        }

        $allExcludeIds = array_unique(array_merge([$userId], $friendIds, $excludeIds));

        $suggestedUsers = DB::table('friendships')
            ->select('candidate_id', DB::raw('COUNT(*) as mutual_friends_count'))
            ->fromSub(function ($query) use ($friendIds, $allExcludeIds) {
                $query->select(DB::raw('friend_id as candidate_id'))
                    ->from('friendships')
                    ->whereIn('user_id', $friendIds)
                    ->whereNotIn('friend_id', $allExcludeIds)
                    ->unionAll(
                        DB::table('friendships')
                            ->select(DB::raw('user_id as candidate_id'))
                            ->whereIn('friend_id', $friendIds)
                            ->whereNotIn('user_id', $allExcludeIds)
                    );
            }, 'fof')
            ->groupBy('candidate_id')
            ->orderByDesc('mutual_friends_count')
            ->limit($limit)
            ->get();

        if ($suggestedUsers->isEmpty()) {
            return collect();
        }

        $candidateIds = $suggestedUsers->pluck('candidate_id')->all();
        $mutualCounts = $suggestedUsers->pluck('mutual_friends_count', 'candidate_id');

        $users = \App\Models\User::whereIn('id', $candidateIds)
            ->where('is_banned', false)
            ->where('role', '!=', 'admin')
            ->get();

        return $users->map(function ($user) use ($mutualCounts) {
            $user->mutual_friends_count = $mutualCounts[$user->id] ?? 0;
            $user->relationship_status = 'none';
            return $user;
        })->sortByDesc('mutual_friends_count')->values();
    }

    public function getFriendshipStatus(int $userId, int $friendId)
    {
        return $this->model->where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $userId);
        })->exists();
    }
}
