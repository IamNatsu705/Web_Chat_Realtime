<?php

namespace App\Services\Admin;

use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Repositories\MessageRepo\MessageRepositoryInterface;
use App\Repositories\PostRepo\PostRepositoryInterface;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Exception;

/**
 * Service Quản trị (Admin Service).
 *
 * Xử lý toàn bộ nghiệp vụ dành cho Quản trị viên:
 * - Dashboard thống kê tổng quan (biểu đồ, top posts, most active users).
 * - Quản lý người dùng: ban/unban.
 * - Quản lý bài đăng: ẩn/khôi phục.
 */
class AdminService implements AdminServiceInterface
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected PostRepositoryInterface $postRepository,
        protected MessageRepositoryInterface $messageRepository,
    ) {}

    /**
     * Lấy dữ liệu tổng quan cho Dashboard quản trị.
     *
     * Bao gồm:
     * - Thống kê cơ bản: tổng user, bài viết, tin nhắn, user bị ban.
     * - So sánh giữa 2 tuần gần nhất (để tính % tăng/giảm trên UI).
     * - Dữ liệu biểu đồ theo ngày (7 ngày gần nhất).
     * - Top bài viết có tương tác cao nhất.
     * - Người dùng hoạt động nhiều nhất.
     */
    public function getDashboardStats(): array
    {
        $now = now();
        $weekAgo = $now->copy()->subDays(7);
        $twoWeeksAgo = $now->copy()->subDays(14);

        // Thống kê số lượng theo ngày cho biểu đồ
        $dailyUsers = $this->userRepository->getDailyCount(7);
        $dailyPosts = $this->postRepository->getDailyCount(7);
        $dailyMessages = $this->messageRepository->getDailyCount(7);

        // Xây dựng mảng dữ liệu biểu đồ (daily_stats)
        $dailyStats = [];
        foreach ($dailyUsers as $date => $count) {
            $dailyStats[] = [
                'date' => \Carbon\Carbon::parse($date)->format('d/m'),
                'users' => $count,
                'posts' => $dailyPosts[$date] ?? 0,
                'messages' => $dailyMessages[$date] ?? 0,
            ];
        }

        // Bài viết có tương tác cao nhất (7 ngày gần nhất)
        $topPosts = $this->postRepository->getTopEngagement(5);

        // Người dùng hoạt động nhiều nhất (7 ngày gần nhất)
        $mostActiveUsers = $this->userRepository->getMostActive(5);

        return [
            // ── Thống kê cơ bản ──
            'total_users' => $this->userRepository->countAll(),
            'new_users_week' => $this->userRepository->countSince($weekAgo),
            'total_posts' => $this->postRepository->countAll(),
            'new_posts_week' => $this->postRepository->countSince($weekAgo),
            'total_messages' => $this->messageRepository->countAll(),
            'banned_users' => $this->userRepository->countBanned(),

            // ── So sánh giữa các kỳ (để tính % tăng/giảm trên UI) ──
            'prev_users_week' => $this->userRepository->countBetween($twoWeeksAgo, $weekAgo),
            'prev_posts_week' => $this->postRepository->countBetween($twoWeeksAgo, $weekAgo),

            // ── Chỉ số bổ sung ──
            'hidden_posts_count' => $this->postRepository->countHidden(),
            'active_users_today' => $this->userRepository->countActiveToday(),

            // ── Dữ liệu biểu đồ ──
            'daily_stats' => $dailyStats,

            // ── Bài viết tương tác cao nhất (serialize trực tiếp) ──
            'top_posts' => $topPosts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'status' => $post->status,
                    'likes_count' => $post->likes_count,
                    'comments_count' => $post->comments_count,
                    'created_at' => $post->created_at,
                    'user' => $post->user ? [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'avatar' => $post->user->avatar,
                    ] : null,
                ];
            })->values(),

            // ── Người dùng hoạt động nhiều nhất ──
            'most_active_users' => $mostActiveUsers->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'is_banned' => $user->is_banned,
                    'posts_count' => (int) $user->posts_count,
                    'messages_count' => (int) $user->messages_count,
                ];
            })->values(),
        ];
    }

    /** {@inheritdoc} */
    public function getUsers(int $perPage = 15, ?string $search = null, ?string $status = null)
    {
        return $this->userRepository->getForAdmin($perPage, $search, $status);
    }

    /**
     * Khóa tài khoản người dùng.
     * Không cho phép khóa tài khoản admin hoặc chính mình.
     * Thu hồi tất cả token đăng nhập (buộc đăng xuất).
     */
    public function banUser(int $userId, int $adminId, string $reason): void
    {
        $user = $this->userRepository->findOrFail($userId);

        if ($user->isAdmin()) {
            throw new Exception('Không thể khoá tài khoản admin.');
        }

        if ($user->id === $adminId) {
            throw new Exception('Không thể khoá tài khoản chính mình.');
        }

        $user->update([
            'is_banned' => true,
            'banned_at' => now(),
            'ban_reason' => $reason,
        ]);

        // Thu hồi tất cả token đăng nhập (buộc người dùng đăng xuất)
        $user->tokens()->delete();
    }

    /**
     * Mở khóa tài khoản người dùng — xóa thông tin ban.
     */
    public function unbanUser(int $userId): void
    {
        $user = $this->userRepository->findOrFail($userId);

        $user->update([
            'is_banned' => false,
            'banned_at' => null,
            'ban_reason' => null,
        ]);
    }

    /** {@inheritdoc} */
    public function getPosts(int $perPage = 15, ?string $status = null, ?string $search = null)
    {
        return $this->postRepository->getForAdmin($perPage, $status, $search);
    }

    /**
     * Ẩn bài đăng vi phạm — ghi nhận lý do và admin thực hiện.
     */
    public function hidePost(int $postId, int $adminId, string $reason): void
    {
        $post = $this->postRepository->findOrFail($postId);
        $post->update([
            'status' => 'hidden',
            'hide_reason' => $reason,
            'hidden_by' => $adminId,
        ]);
    }

    /**
     * Khôi phục bài đăng đã bị ẩn — chuyển status về 'active', xóa thông tin ẩn.
     */
    public function restorePost(int $postId): void
    {
        $post = $this->postRepository->findOrFail($postId);
        $post->update([
            'status' => 'active',
            'hide_reason' => null,
            'hidden_by' => null,
        ]);
    }
}
