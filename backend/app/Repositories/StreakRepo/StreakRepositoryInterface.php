<?php

namespace App\Repositories\StreakRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

/**
 * Interface Repository Chuỗi ngày nhắn tin (Streak Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến Streak
 * (chuỗi ngày nhắn tin liên tiếp giữa hai người dùng).
 */
interface StreakRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy Streak theo ID cuộc trò chuyện.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @return \App\Models\Streak|null
     */
    public function getByConversationId(int $conversationId);

    /**
     * Lấy hoặc tạo mới Streak cho một cuộc trò chuyện.
     * User A và User B được sắp xếp theo ID nhỏ/lớn để đảm bảo tính nhất quán.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userAId        ID người dùng A.
     * @param int $userBId        ID người dùng B.
     * @return \App\Models\Streak
     */
    public function getOrCreate(int $conversationId, int $userAId, int $userBId);

    /**
     * Lấy tất cả Streak đang hoạt động/chờ khôi phục cần kiểm tra.
     * Dùng cho cron job kiểm tra streak hết hạn hàng ngày.
     *
     * Điều kiện: current_streak > 0, status != 'lost',
     * và last_completed_date trước ngày hôm nay (có khả năng bị lỡ ngày).
     */
    public function getActiveStreaksNeedingCheck();
}
