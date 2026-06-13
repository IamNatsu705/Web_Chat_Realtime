<?php

namespace App\Repositories\PostLikeRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

/**
 * Interface Repository Lượt thích bài đăng (Post Like Repository Interface).
 *
 * Định nghĩa các phương thức quản lý lượt thích bài đăng.
 */
interface PostLikeRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Tìm lượt thích theo bài đăng và người dùng.
     *
     * @param int $postId ID bài đăng.
     * @param int $userId ID người dùng.
     * @return \App\Models\PostLike|null
     */
    public function findByPostAndUser(int $postId, int $userId);

    /**
     * Xóa lượt thích (bỏ thích bài đăng).
     *
     * @param int $postId ID bài đăng.
     * @param int $userId ID người dùng.
     * @return bool
     */
    public function deleteByPostAndUser(int $postId, int $userId): bool;

    /**
     * Lấy danh sách ID bài đăng mà người dùng đã thích (dùng để hiển thị trạng thái nút Like).
     *
     * @param int   $userId  ID người dùng.
     * @param array $postIds Mảng ID bài đăng cần kiểm tra.
     * @return array Mảng ID bài đăng đã được thích.
     */
    public function getLikedPostIds(int $userId, array $postIds): array;
}
