<?php

namespace App\Services\Chat;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface GroupResourceServiceInterface
{
    /**
     * Lấy danh sách tài liệu của nhóm (phân trang, tìm kiếm, lọc).
     */
    public function getResources(int $groupId, int $userId, ?string $search, ?string $category, int $perPage = 15): LengthAwarePaginator;

    /**
     * Upload tài liệu mới vào nhóm.
     * Sử dụng streaming để tránh crash/đơ khi upload file lớn (tối đa 50MB).
     */
    public function uploadResource(int $groupId, int $userId, array $data): Model;

    /**
     * Xóa tài liệu (người upload hoặc owner/mod).
     */
    public function deleteResource(int $resourceId, int $userId): void;

    /**
     * Ghim/bỏ ghim tài liệu (chỉ owner/mod).
     */
    public function togglePin(int $resourceId, int $userId): Model;

    /**
     * Lấy thông tin tài liệu để tải xuống + tăng download_count.
     */
    public function downloadResource(int $resourceId, int $userId): Model;
}
