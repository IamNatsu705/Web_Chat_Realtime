<?php

namespace App\Services\Post;

use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

/**
 * Interface Service Bài đăng (Post Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến bài đăng:
 * bảng tin, CRUD bài viết, lượt thích, bình luận.
 */
interface PostServiceInterface
{
    /**
     * Lấy bảng tin (feed) với thông tin is_liked của người dùng.
     *
     * @param int         $userId ID người dùng đang xem.
     * @param string|null $cursor Con trỏ phân trang.
     */
    public function getFeed(int $userId, ?string $cursor): CursorPaginator;

    /**
     * Lấy thông tin chi tiết bài đăng theo ID, kèm trạng thái is_liked.
     *
     * @param int $postId ID bài đăng.
     * @param int $userId ID người dùng đang xem.
     */
    public function getPostById(int $postId, int $userId): Model;

    /**
     * Lấy bài viết của một người dùng (trang cá nhân), kèm trạng thái is_liked.
     *
     * @param int $userId   ID chủ trang cá nhân.
     * @param int $viewerId ID người đang xem.
     */
    public function getUserPosts(int $userId, int $viewerId): LengthAwarePaginator;

    /**
     * Tạo bài đăng mới (hỗ trợ đính kèm nhiều ảnh/video).
     *
     * @param int   $userId ID người tạo.
     * @param array $data   Dữ liệu bài đăng (content, media[]).
     */
    public function createPost(int $userId, array $data): Model;

    /**
     * Cập nhật nội dung bài đăng (chỉ chủ bài viết).
     *
     * @param int   $postId ID bài đăng.
     * @param int   $userId ID người cập nhật.
     * @param array $data   Dữ liệu cập nhật (content).
     */
    public function updatePost(int $postId, int $userId, array $data): Model;

    /**
     * Xóa bài đăng (chủ bài viết hoặc admin).
     *
     * @param int $postId ID bài đăng.
     * @param int $userId ID người xóa.
     */
    public function deletePost(int $postId, int $userId): void;

    /**
     * Thích/bỏ thích bài đăng (toggle).
     *
     * @param int $postId ID bài đăng.
     * @param int $userId ID người dùng.
     * @return array Mảng ['liked' => bool, 'likes_count' => int].
     */
    public function toggleLike(int $postId, int $userId): array;

    /**
     * Lấy danh sách bình luận gốc (cấp 1) của bài đăng, kèm replies.
     *
     * @param int $postId  ID bài đăng.
     * @param int $perPage Số bình luận mỗi trang.
     */
    public function getComments(int $postId, int $perPage = 15): LengthAwarePaginator;

    /**
     * Tạo bình luận mới (hỗ trợ trả lời bình luận, giới hạn 2 cấp lồng).
     *
     * @param int   $postId ID bài đăng.
     * @param int   $userId ID người bình luận.
     * @param array $data   Dữ liệu bình luận (content, parent_id).
     */
    public function createComment(int $postId, int $userId, array $data): Model;

    /**
     * Cập nhật nội dung bình luận (chỉ chủ bình luận).
     *
     * @param int   $commentId ID bình luận.
     * @param int   $userId    ID người cập nhật.
     * @param array $data      Dữ liệu cập nhật (content).
     */
    public function updateComment(int $commentId, int $userId, array $data): Model;

    /**
     * Xóa bình luận (chủ bình luận, chủ bài viết, hoặc admin).
     *
     * @param int $commentId ID bình luận.
     * @param int $userId    ID người xóa.
     */
    public function deleteComment(int $commentId, int $userId): void;
}
