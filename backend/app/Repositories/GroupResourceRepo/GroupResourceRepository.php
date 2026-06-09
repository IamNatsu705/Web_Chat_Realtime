<?php

namespace App\Repositories\GroupResourceRepo;

use App\Models\GroupResource;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GroupResourceRepository extends BaseRepository implements GroupResourceRepositoryInterface
{
    public function getModel(): string
    {
        return GroupResource::class;
    }

    /**
     * Lấy danh sách tài liệu của nhóm (phân trang, lọc, tìm kiếm).
     * - Tài liệu được ghim hiển thị trước.
     * - Hỗ trợ tìm kiếm theo title và description.
     * - Hỗ trợ lọc theo category (exam, lecture, exercise, note, other).
     */
    public function getByConversation(int $conversationId, ?string $search, ?string $category, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model
            ->where('conversation_id', $conversationId)
            ->with('uploader');

        // Lọc theo danh mục
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        // Tìm kiếm theo tiêu đề hoặc mô tả
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Tài liệu ghim lên đầu, sau đó sắp xếp theo mới nhất
        return $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Đếm tổng tài liệu của nhóm.
     */
    public function countByConversation(int $conversationId): int
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->count();
    }
}
