<?php

namespace App\Repositories\PostCommentRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface Repository Bình luận bài đăng (Post Comment Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến bình luận.
 */
interface PostCommentRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy danh sách bình luận gốc (cấp 1) của một bài đăng, kèm replies.
     *
     * @param int $postId  ID bài đăng.
     * @param int $perPage Số bình luận mỗi trang.
     * @return LengthAwarePaginator
     */
    public function getByPostId(int $postId, int $perPage = 15): LengthAwarePaginator;
}
