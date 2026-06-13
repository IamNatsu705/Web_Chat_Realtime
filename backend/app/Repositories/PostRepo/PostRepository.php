<?php

namespace App\Repositories\PostRepo;

use App\Models\Post;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Repository Bài đăng (Post Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng posts.
 * Hỗ trợ bảng tin, trang cá nhân, trang quản trị, và thống kê hoạt động.
 */
class PostRepository extends BaseRepository implements PostRepositoryInterface
{
    public function getModel(): string
    {
        return Post::class;
    }

    /** {@inheritdoc} */
    public function getByUserId(int $userId): Collection
    {
        return $this->model
            ->with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Lấy bảng tin (feed) với phân trang dạng cursor.
     * Bài ghim hiển thị trước, sau đó sắp xếp theo ngày tạo giảm dần.
     * Chỉ hiển thị bài viết có trạng thái 'active'.
     */
    public function getFeed(int $perPage = 15, ?string $cursor = null): CursorPaginator
    {
        return $this->model
            ->with(['user', 'media'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Lấy bài viết của một người dùng (trang cá nhân).
     * Chủ sở hữu thấy được tất cả (bao gồm bài bị ẩn), người khác chỉ thấy bài active.
     */
    public function getUserPosts(int $userId, int $viewerId, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model
            ->with(['user', 'media'])
            ->where('user_id', $userId);

        // Nếu người xem không phải chủ sở hữu => chỉ hiển thị bài active
        if ($viewerId !== $userId) {
            $query->where('status', 'active');
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Lấy bài viết cho trang Quản trị, hỗ trợ lọc theo trạng thái và tìm kiếm.
     */
    public function getForAdmin(int $perPage = 15, ?string $status = null, ?string $search = null): LengthAwarePaginator
    {
        $query = $this->model->with(['user', 'media', 'hiddenByAdmin']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /** {@inheritdoc} */
    public function countAll(): int
    {
        return $this->model->count();
    }

    /** {@inheritdoc} */
    public function countSince(\Carbon\Carbon $date): int
    {
        return $this->model->where('created_at', '>=', $date)->count();
    }

    /** {@inheritdoc} */
    public function countBetween(\Carbon\Carbon $from, \Carbon\Carbon $to): int
    {
        return $this->model->whereBetween('created_at', [$from, $to])->count();
    }

    /** {@inheritdoc} */
    public function countHidden(): int
    {
        return $this->model->where('status', 'hidden')->count();
    }

    /**
     * Lấy các bài viết có tương tác cao nhất (lượt thích + bình luận) trong 7 ngày gần nhất.
     */
    public function getTopEngagement(int $limit = 5): \Illuminate\Support\Collection
    {
        return $this->model
            ->with(['user', 'media'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByRaw('(likes_count + comments_count) DESC')
            ->limit($limit)
            ->get();
    }

    /**
     * Thống kê số bài viết theo ngày trong N ngày gần nhất.
     * Điền giá trị 0 cho những ngày không có bài viết.
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
