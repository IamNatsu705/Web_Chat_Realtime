<?php

namespace App\Repositories\ConversationParticipantRepo;

use App\Models\ConversationParticipant;
use App\Repositories\BaseRepo\BaseRepositoryInterface;

/**
 * Interface Repository Thành viên cuộc trò chuyện (Conversation Participant Repository Interface).
 *
 * Định nghĩa các phương thức quản lý thành viên trong cuộc trò chuyện,
 * bao gồm thêm, xóa, cập nhật trạng thái, và lấy thông tin thành viên.
 */
interface ConversationParticipantRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Tạo thành viên mới cho cuộc trò chuyện.
     *
     * @param int    $conversationId ID cuộc trò chuyện.
     * @param int    $userId         ID người dùng.
     * @param string $status         Trạng thái tham gia ('active', 'pending', 'rejected').
     */
    public function createConversationParticipant(int $conversationId, int $userId, string $status);

    /**
     * Lấy thành viên đối phương trong cuộc trò chuyện 1-1.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng hiện tại (sẽ bị loại trừ).
     */
    public function getOtherParticipant(int $conversationId, int $userId);

    /**
     * Lấy danh sách ID tất cả thành viên trong cuộc trò chuyện.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @return array Mảng user IDs.
     */
    public function getParticipantIds(int $conversationId): array;

    /**
     * Lấy bản ghi thành viên cụ thể (theo conversation_id và user_id).
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng.
     * @return ConversationParticipant|null
     */
    public function getParticipant(int $conversationId, int $userId): ?ConversationParticipant;

    /**
     * Xóa thành viên khỏi cuộc trò chuyện.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng cần xóa.
     * @return bool
     */
    public function deleteByConversationAndUser(int $conversationId, int $userId): bool;

    /**
     * Cập nhật thời điểm xóa lịch sử trò chuyện (cleared_at = now()).
     * Tin nhắn trước thời điểm này sẽ bị ẩn khỏi giao diện người dùng.
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng.
     */
    public function updateClearedAt(int $conversationId, int $userId): void;

    /**
     * Thêm nhiều thành viên cùng lúc (batch insert).
     *
     * @param array $participants Mảng dữ liệu thành viên.
     */
    public function insertMany(array $participants): void;

    /**
     * Kích hoạt (activate) các thành viên có trạng thái pending/rejected.
     * Dùng khi hai người trở thành bạn bè — cuộc trò chuyện người lạ chuyển thành bạn bè.
     *
     * @param int   $conversationId ID cuộc trò chuyện.
     * @param array $userIds        Mảng user IDs cần kích hoạt.
     */
    public function activateParticipants(int $conversationId, array $userIds): void;
}
