<?php

namespace App\Repositories\GroupJoinRequestRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Support\Collection;

interface GroupJoinRequestRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy danh sách yêu cầu đang chờ duyệt của một nhóm.
     */
    public function getPendingRequests(int $conversationId): Collection;

    /**
     * Tìm yêu cầu pending của user trong nhóm.
     */
    public function findPendingByUser(int $conversationId, int $userId);

    /**
     * Xóa yêu cầu của user trong nhóm (khi user đã là member hoặc hủy request).
     */
    public function deleteByConversationAndUser(int $conversationId, int $userId): bool;
}
