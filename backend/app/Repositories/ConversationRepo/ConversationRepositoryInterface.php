<?php

namespace App\Repositories\ConversationRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

/**
 * Interface Repository Cuộc trò chuyện (Conversation Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến cuộc trò chuyện,
 * bao gồm lấy danh sách, tìm cuộc trò chuyện 1-1, và lấy danh sách cộng đồng.
 */
interface ConversationRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy danh sách tất cả cuộc trò chuyện của một người dùng.
     * Bao gồm tính toán sẵn số tin nhắn chưa đọc và sắp xếp theo tin mới nhất.
     *
     * @param int $userId ID người dùng.
     */
    public function getUserConversations(int $userId);

    /**
     * Tìm cuộc trò chuyện 1-1 giữa hai người dùng (nếu đã tồn tại).
     *
     * @param int $userId   ID người dùng thứ nhất.
     * @param int $friendId ID người dùng thứ hai.
     */
    public function getDirectConversation(int $userId, int $friendId);

    /**
     * Lấy danh sách nhóm cộng đồng (open/request) cho trang Khám phá.
     * Hỗ trợ tìm kiếm theo tên/mô tả và lọc theo danh mục.
     *
     * @param string|null $search   Từ khóa tìm kiếm.
     * @param string|null $category Danh mục lọc (subject, department, project...).
     * @param int         $perPage  Số bản ghi mỗi trang.
     * @param int|null    $userId   ID người dùng (để kiểm tra trạng thái tham gia).
     */
    public function getCommunities(?string $search, ?string $category, int $perPage = 12, ?int $userId = null);
}
