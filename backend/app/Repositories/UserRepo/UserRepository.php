<?php

namespace App\Repositories\UserRepo;

use App\Models\User;
use App\Repositories\BaseRepo\BaseRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Repository Người dùng (User Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng users, bao gồm:
 * - Tìm kiếm người dùng kèm trạng thái quan hệ (bạn bè, pending, none).
 * - Thống kê cho Dashboard quản trị (tổng user, user mới, user bị ban).
 * - Theo dõi hoạt động (most active, active today).
 */
class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function getModel()
    {
        return User::class;
    }

    /** {@inheritdoc} */
    public function findByEmail(string $email)
    {
        return $this->findByField('email', $email);
    }

    /**
     * Tìm kiếm người dùng theo từ khóa, kèm thông tin trạng thái quan hệ.
     *
     * Kỹ thuật: LEFT JOIN với bảng friend_requests và friendships để xác định
     * trạng thái quan hệ (accepted, pending, none) trong 1 truy vấn duy nhất,
     * tránh lỗi N+1 khi phải kiểm tra từng user riêng lẻ.
     */
    public function searchByKeyword(string $keyword, int $currentUserId)
    {
        return $this->model
            ->select('users.id', 'users.name', 'users.email', 'users.avatar', 'users.bio', 'users.student_id', 'users.department')
            ->leftJoin('friend_requests', function ($join) use ($currentUserId) {
                $join->on(function ($q) use ($currentUserId) {
                    $q->on('friend_requests.sender_id', '=', DB::raw($currentUserId))
                        ->on('friend_requests.receiver_id', '=', 'users.id');
                })->orOn(function ($q) use ($currentUserId) {
                    $q->on('friend_requests.receiver_id', '=', DB::raw($currentUserId))
                        ->on('friend_requests.sender_id', '=', 'users.id');
                })->where('friend_requests.status', 'pending');
            })
            // 2. JOIN với Friendships — kiểm tra quan hệ bạn bè cả hai chiều
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
                // Xác định trạng thái quan hệ: accepted (bạn bè) > pending (đang chờ) > none
                DB::raw("CASE
                WHEN friendships.id IS NOT NULL THEN 'accepted'
                WHEN friend_requests.id IS NOT NULL THEN 'pending'
                ELSE 'none'
            END as relationship_status"),

                'friend_requests.id as friend_request_id',

                // Đánh dấu người dùng hiện tại có phải là người gửi lời mời không
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
            ->where('users.role', '!=', 'admin')
            // GROUP BY cần bao quát hết các trường để tránh lỗi SQL Strict Mode
            ->groupBy(
                'users.id',
                'users.name',
                'users.email',
                'users.avatar',
                'users.bio',
                'users.student_id',
                'users.department',
                'friendships.id',
                'friend_requests.id',
                'friend_requests.status',
                'friend_requests.sender_id'
            )
            ->get();
    }

    /** {@inheritdoc} */
    public function countAll(): int
    {
        return $this->model->count();
    }

    /** {@inheritdoc} */
    public function countSince(Carbon $date): int
    {
        return $this->model->where('created_at', '>=', $date)->count();
    }

    /** {@inheritdoc} */
    public function countBanned(): int
    {
        return $this->model->where('is_banned', true)->count();
    }

    /**
     * Lấy danh sách người dùng cho trang Quản trị.
     * Loại bỏ tài khoản admin khỏi danh sách.
     * Hỗ trợ tìm kiếm theo tên/email và lọc theo trạng thái (active/banned).
     */
    public function getForAdmin(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        $query = $this->model->where('role', '!=', 'admin');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status === 'banned') {
            $query->where('is_banned', true);
        } elseif ($status === 'active') {
            $query->where('is_banned', false);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /** {@inheritdoc} */
    public function countBetween(Carbon $from, Carbon $to): int
    {
        return $this->model->whereBetween('created_at', [$from, $to])->count();
    }

    /**
     * Lấy những người dùng hoạt động nhiều nhất (theo số bài viết + tin nhắn) trong 7 ngày gần nhất.
     */
    public function getMostActive(int $limit = 5): \Illuminate\Support\Collection
    {
        return $this->model
            ->select('users.*')
            ->selectRaw('(SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id AND posts.created_at >= ?) as posts_count', [now()->subDays(7)])
            ->selectRaw('(SELECT COUNT(*) FROM messages WHERE messages.sender_id = users.id AND messages.created_at >= ?) as messages_count', [now()->subDays(7)])
            ->where('role', '!=', 'admin')
            ->orderByRaw('(posts_count + messages_count) DESC')
            ->limit($limit)
            ->get();
    }

    /** {@inheritdoc} */
    public function countActiveToday(): int
    {
        return $this->model
            ->where('last_seen_at', '>=', now()->startOfDay())
            ->count();
    }

    /**
     * Thống kê số người dùng mới theo ngày trong N ngày gần nhất.
     * Điền giá trị 0 cho những ngày không có người dùng mới đăng ký.
     */
    public function getDailyCount(int $days = 7): array
    {
        $results = $this->model
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Điền giá trị 0 cho những ngày không có dữ liệu
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $data[$date] = $results[$date] ?? 0;
        }

        return $data;
    }
}
