<?php

namespace App\Services\Network;

/**
 * Interface Service Mạng lưới (Network Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến mạng lưới bạn bè:
 * gửi/hủy/phản hồi lời mời kết bạn, quản lý danh sách bạn bè, và gợi ý kết bạn.
 */
interface NetworkServiceInterface
{
    /**
     * Gửi lời mời kết bạn.
     *
     * @param int $senderId   ID người gửi.
     * @param int $receiverId ID người nhận.
     * @throws \Exception Nếu đã là bạn bè hoặc lời mời đã tồn tại.
     */
    public function sendFriendRequest(int $senderId, int $receiverId);

    /**
     * Lấy danh sách lời mời kết bạn đang chờ mà người dùng nhận được.
     *
     * @param int $userId ID người nhận.
     */
    public function getIncomingRequests(int $userId);

    /**
     * Lấy danh sách tất cả bạn bè của người dùng.
     *
     * @param int $userId ID người dùng.
     */
    public function getFriends(int $userId);

    /**
     * Hủy lời mời kết bạn đã gửi.
     *
     * @param int $senderId   ID người gửi.
     * @param int $receiverId ID người nhận.
     */
    public function cancelFriendRequest(int $senderId, int $receiverId): void;

    /**
     * Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối).
     * Nếu chấp nhận: tạo bản ghi bạn bè + cuộc trò chuyện + tin nhắn hệ thống.
     *
     * @param int    $requestId     ID lời mời.
     * @param int    $currentUserId ID người phản hồi (phải là receiver).
     * @param string $action        Hành động: 'accept' hoặc 'reject'.
     */
    public function respondToRequest(int $requestId, int $currentUserId, string $action): void;

    /**
     * Hủy kết bạn (unfriend).
     *
     * @param int $userId   ID người dùng.
     * @param int $friendId ID bạn bè cần hủy.
     */
    public function unfriend(int $userId, int $friendId): void;

    /**
     * Gợi ý kết bạn thông minh dựa trên bạn chung (mutual friends).
     * Fallback: gợi ý theo cùng khoa/ngành cho tân sinh viên.
     *
     * @param int $userId ID người dùng.
     * @param int $limit  Số lượng gợi ý tối đa.
     */
    public function getSuggestedFriends(int $userId, int $limit = 10);
}
