<?php

namespace App\Repositories\FriendRequestRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

/**
 * Interface Repository Lời mời kết bạn (Friend Request Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến lời mời kết bạn.
 */
interface FriendRequestRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Tìm lời mời kết bạn đang chờ (pending) giữa hai người dùng.
     *
     * @param int $senderId   ID người gửi.
     * @param int $receiverId ID người nhận.
     * @return \App\Models\FriendRequest|null
     */
    public function findPendingRequest(int $senderId, int $receiverId);

    /**
     * Lấy danh sách lời mời kết bạn đang chờ mà người dùng nhận được.
     *
     * @param int $receiverId ID người nhận.
     */
    public function getIncomingRequests(int $receiverId);

    /**
     * Tìm lời mời kết bạn đã gửi (pending) từ sender đến receiver.
     *
     * @param int $senderId   ID người gửi.
     * @param int $receiverId ID người nhận.
     * @return \App\Models\FriendRequest|null
     */
    public function findSentRequest(int $senderId, int $receiverId);

    /**
     * Lấy danh sách ID người nhận mà người dùng đã gửi lời mời kết bạn (pending).
     * Dùng để loại trừ khỏi gợi ý kết bạn.
     *
     * @param int $userId ID người gửi.
     * @return \Illuminate\Support\Collection
     */
    public function getSentPendingRequestIds(int $userId): \Illuminate\Support\Collection;
}
