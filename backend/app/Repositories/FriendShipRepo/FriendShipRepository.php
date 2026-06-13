<?php

namespace App\Repositories\FriendshipRepo;

use App\Models\Friendship;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Repository Quan hệ bạn bè (Friendship Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng friendships.
 * Lưu ý: Quan hệ bạn bè lưu 1 chiều, nên mọi truy vấn đều phải kiểm tra cả hai chiều
 * (user_id, friend_id) và (friend_id, user_id).
 */
class FriendshipRepository extends BaseRepository implements FriendshipRepositoryInterface
{
    public function getModel(): string
    {
        return Friendship::class;
    }

    /**
     * Kiểm tra hai người dùng có phải bạn bè không (kiểm tra cả hai chiều).
     */
    public function checkIsFriend(int $userId, int $friendId)
    {
        return $this->model->where(function ($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->first();
    }

    /**
     * Lấy danh sách bạn bè kèm thông tin user (eager load), sắp xếp theo thời gian kết bạn.
     */
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

    /**
     * Xóa quan hệ bạn bè giữa hai người dùng (kiểm tra cả hai chiều).
     */
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
     * Lấy tất cả ID bạn bè của user (1 truy vấn nhẹ, indexed).
     * Query cả 2 chiều rồi merge lại.
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
     * ║  GIẢI THUẬT TỐI ƯU (2 bước, không correlated subquery):             ║
     * ║                                                                      ║
     * ║  B1: Gọi getFriendIds() lấy danh sách friend_ids (đã indexed)        ║
     * ║  B2: Query friendships WHERE user_id IN (friend_ids)                 ║
     * ║      => Tìm friend-of-friend (không phải chính mình, chưa kết bạn)   ║
     * ║      => GROUP BY + COUNT => đếm mutual friends                       ║
     * ║      => ORDER BY mutual_count DESC => sắp xếp theo số bạn chung      ║
     * ║                                                                      ║
     * ║  Complexity: O(F) cho B1 + O(F*avg_friends) cho B2                   ║
     * ║  So với correlated subquery: O(N*F) với N=total users                ║
     * ╚══════════════════════════════════════════════════════════════════════╝
     */
    public function getSuggestedFriends(int $userId, array $friendIds, array $excludeIds = [], int $limit = 10): Collection
    {
        if (empty($friendIds)) {
            return collect();
        }

        // Tổng hợp tất cả ID cần loại trừ: chính mình + bạn bè hiện tại + pending requests
        $allExcludeIds = array_unique(array_merge([$userId], $friendIds, $excludeIds));

        // Tìm bạn-của-bạn (friend-of-friend) và đếm số bạn chung
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

        // Lấy thông tin chi tiết user và gắn số bạn chung
        $users = \App\Models\User::whereIn('id', $candidateIds)
            ->where('is_banned', false)
            ->where('role', '!=', 'admin')
            ->get();

        $pendingRequests = \App\Models\FriendRequest::where('status', 'pending')
            ->where(function($q) use ($userId, $candidateIds) {
                $q->where(function($q2) use ($userId, $candidateIds) {
                    $q2->where('sender_id', $userId)->whereIn('receiver_id', $candidateIds);
                })->orWhere(function($q2) use ($userId, $candidateIds) {
                    $q2->where('receiver_id', $userId)->whereIn('sender_id', $candidateIds);
                });
            })->get();

        return $users->map(function ($user) use ($mutualCounts, $pendingRequests, $userId) {
            $user->mutual_friends_count = $mutualCounts[$user->id] ?? 0;
            
            $req = $pendingRequests->first(function($r) use ($user, $userId) {
                return ($r->sender_id == $userId && $r->receiver_id == $user->id) ||
                       ($r->receiver_id == $userId && $r->sender_id == $user->id);
            });

            if ($req) {
                $user->relationship_status = 'pending';
                $user->is_sender = (bool) ($req->sender_id == $userId);
                $user->friend_request_id = $req->id;
            } else {
                $user->relationship_status = 'none';
            }
            return $user;
        })->sortByDesc('mutual_friends_count')->values();
    }

    /**
     * Kiểm tra trạng thái quan hệ bạn bè (tồn tại hay không).
     * Trả về true nếu hai người dùng đã là bạn bè.
     */
    public function getFriendshipStatus(int $userId, int $friendId)
    {
        return $this->model->where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $userId);
        })->exists();
    }
}
