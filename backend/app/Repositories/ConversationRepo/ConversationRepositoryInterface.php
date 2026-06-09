<?php

namespace App\Repositories\ConversationRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface ConversationRepositoryInterface extends BaseRepositoryInterface
{
    public function getUserConversations(int $userId);
    public function getDirectConversation(int $userId, int $friendId);

    /**
     * Lấy danh sách nhóm cộng đồng (open/request) cho trang khám phá.
     * Hỗ trợ tìm kiếm theo tên/mô tả và lọc theo danh mục.
     */
    public function getCommunities(?string $search, ?string $category, int $perPage = 12, ?int $userId = null);
}
