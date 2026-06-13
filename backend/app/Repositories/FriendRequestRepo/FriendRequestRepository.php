<?php

namespace App\Repositories\FriendRequestRepo;

use App\Models\FriendRequest;
use App\Repositories\BaseRepo\BaseRepository;

/**
 * Repository Lời mời kết bạn (Friend Request Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng friend_requests.
 */
class FriendRequestRepository extends BaseRepository implements FriendRequestRepositoryInterface
{
    public function getModel(): string
    {
        return FriendRequest::class;
    }

    /** {@inheritdoc} */
    public function findPendingRequest(int $senderId, int $receiverId)
    {
        return $this->model->where([
            ['sender_id', '=', $senderId],
            ['receiver_id', '=', $receiverId],
            ['status', '=', 'pending'],
        ])->first();
    }

    /**
     * Lấy danh sách lời mời đang chờ duyệt, sắp xếp mới nhất trước.
     * Eager load thông tin người gửi (sender) để hiển thị trên UI.
     */
    public function getIncomingRequests(int $userId)
    {
        return $this->model
            ->with('sender')
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** {@inheritdoc} */
    public function findSentRequest(int $senderId, int $receiverId)
    {
        return $this->findPendingRequest($senderId, $receiverId);
    }

    /**
     * Lấy danh sách ID người nhận mà user đã gửi lời mời (pending).
     * Dùng để loại trừ khỏi gợi ý kết bạn — tránh gợi ý người đã gửi lời mời.
     */
    public function getSentPendingRequestIds(int $userId): \Illuminate\Support\Collection
    {
        return $this->model
            ->where('sender_id', $userId)
            ->where('status', 'pending')
            ->pluck('receiver_id');
    }
}
