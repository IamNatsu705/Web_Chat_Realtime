<?php

namespace App\Repositories\MessageRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

/**
 * Interface Repository Tin nhắn (Message Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến tin nhắn,
 * bao gồm lấy danh sách tin nhắn (phân trang cursor), đánh dấu đã đọc, và thống kê.
 */
interface MessageRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy danh sách tin nhắn theo cuộc trò chuyện (phân trang dạng cursor).
     * Tự động lọc tin nhắn đã xóa phía mình và tin nhắn trước cleared_at.
     *
     * @param int         $conversationId ID cuộc trò chuyện.
     * @param int         $userId         ID người dùng (để lọc tin nhắn đã xóa).
     * @param int         $limit          Số tin nhắn mỗi trang.
     * @param string|null $cursor         Con trỏ phân trang (null = trang đầu tiên).
     */
    public function getMessagesByConversationId(int $conversationId, int $userId, int $limit, ?string $cursor);

    /**
     * Đánh dấu tất cả tin nhắn chưa đọc là đã đọc — dùng cho cuộc trò chuyện 1-1.
     * Cập nhật trực tiếp cột read_at trên bảng messages.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng đang đọc.
     */
    public function markMessagesAsRead(int $conversationId, int $userId);

    /**
     * Đánh dấu tất cả tin nhắn chưa đọc là đã đọc — dùng cho cuộc trò chuyện nhóm.
     * Thêm bản ghi vào bảng message_reads (theo dõi riêng từng người).
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng đang đọc.
     */
    public function markGroupMessagesAsRead(int $conversationId, int $userId);

    /**
     * Đếm tổng số tin nhắn trong hệ thống (dùng cho Dashboard quản trị).
     */
    public function countAll(): int;

    /**
     * Thống kê số tin nhắn theo ngày trong N ngày gần nhất.
     *
     * @param int $days Số ngày cần thống kê.
     * @return array Mảng [ngày => số lượng].
     */
    public function getDailyCount(int $days = 7): array;
}
