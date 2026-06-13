<?php

namespace App\Repositories\PostCommentRepo;

use App\Models\PostComment;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Repository Bình luận bài đăng (Post Comment Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng post_comments.
 */
class PostCommentRepository extends BaseRepository implements PostCommentRepositoryInterface
{
    public function getModel(): string
    {
        return PostComment::class;
    }

    /**
     * Lấy danh sách bình luận gốc (parent_id = null) kèm replies (con).
     * Eager load thông tin người dùng và đếm số replies.
     * Sắp xếp theo thời gian mới nhất trước.
     */
    public function getByPostId(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->with(['user', 'replies.user'])
            ->withCount('replies')
            ->where('post_id', $postId)
            ->whereNull('parent_id') // Chỉ lấy bình luận gốc (cấp 1)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
