<?php

namespace App\Repositories\GroupResourceRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface GroupResourceRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy danh sách tài liệu của nhóm (phân trang, lọc, tìm kiếm).
     */
    public function getByConversation(int $conversationId, ?string $search, ?string $category, int $perPage = 15): LengthAwarePaginator;

    /**
     * Đếm tổng tài liệu của nhóm.
     */
    public function countByConversation(int $conversationId): int;
}
