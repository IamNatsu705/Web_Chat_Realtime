<?php

namespace App\Services\Chat;

/**
 * Interface Service Streak (Streak Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến chuỗi nhắn tin liên tiếp (Streak):
 * xử lý khi có tin nhắn mới, khôi phục chuỗi, chia sẻ thành tích, và cron job kiểm tra hàng ngày.
 */
interface StreakServiceInterface
{
    /**
     * Xử lý cập nhật Streak khi tin nhắn mới được gửi trong cuộc trò chuyện 1-1.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $senderId       ID người gửi tin nhắn.
     */
    public function handleMessageSent(int $conversationId, int $senderId): void;

    /**
     * Khôi phục chuỗi Streak khi người dùng bấm nút "Khôi phục".
     * Chỉ áp dụng khi trạng thái là 'pending_restore' và còn lượt.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng thực hiện khôi phục.
     * @return array Thông tin streak sau khi khôi phục.
     */
    public function restoreStreak(int $conversationId, int $userId): array;

    /**
     * Chia sẻ thành tích Streak lên tường cá nhân dưới dạng bài đăng.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng chia sẻ.
     * @return array Thông tin bài đăng đã tạo.
     */
    public function shareStreak(int $conversationId, int $userId): array;

    /**
     * Lấy thông tin Streak của một cuộc trò chuyện để hiển thị trên giao diện.
     *
     * @param int      $conversationId ID cuộc trò chuyện.
     * @param int|null $userId         ID người dùng (để xác định ai là user, ai là partner).
     * @return array|null Null nếu chưa có Streak.
     */
    public function getStreakForConversation(int $conversationId, ?int $userId = null): ?array;

    /**
     * Cron job chạy mỗi ngày: kiểm tra tất cả Streak và xử lý chuỗi bị lỡ ngày.
     */
    public function checkAllStreaks(): void;
}
