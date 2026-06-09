<?php

namespace App\Repositories\GroupJoinRequestRepo;

use App\Models\GroupJoinRequest;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Support\Collection;

class GroupJoinRequestRepository extends BaseRepository implements GroupJoinRequestRepositoryInterface
{
    public function getModel(): string
    {
        return GroupJoinRequest::class;
    }

    /**
     * Lấy danh sách yêu cầu đang chờ duyệt của một nhóm.
     * Eager load thông tin user (avatar, tên, MSSV) để hiển thị trên UI.
     */
    public function getPendingRequests(int $conversationId): Collection
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->where('status', 'pending')
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Tìm yêu cầu pending của user trong nhóm.
     * Dùng để kiểm tra user đã gửi yêu cầu chưa trước khi tạo mới.
     */
    public function findPendingByUser(int $conversationId, int $userId)
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->first();
    }

    /**
     * Xóa yêu cầu của user trong nhóm.
     */
    public function deleteByConversationAndUser(int $conversationId, int $userId): bool
    {
        return (bool) $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete();
    }
}
