<?php

namespace App\Services\Admin;

/**
 * Interface Service Quản trị (Admin Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ dành cho Quản trị viên:
 * Dashboard thống kê, quản lý người dùng (ban/unban), quản lý bài đăng (ẩn/khôi phục).
 */
interface AdminServiceInterface
{
    /**
     * Lấy dữ liệu tổng quan cho Dashboard quản trị.
     * Bao gồm: thống kê cơ bản, biểu đồ theo ngày, top bài viết, user hoạt động nhiều nhất.
     *
     * @return array Dữ liệu Dashboard.
     */
    public function getDashboardStats(): array;

    /**
     * Lấy danh sách người dùng cho trang quản trị (phân trang, tìm kiếm, lọc).
     *
     * @param int         $perPage Số bản ghi mỗi trang.
     * @param string|null $search  Từ khóa tìm kiếm.
     * @param string|null $status  Trạng thái lọc: 'active', 'banned'.
     */
    public function getUsers(int $perPage = 15, ?string $search = null, ?string $status = null);

    /**
     * Khóa tài khoản người dùng (ban) — thu hồi tất cả token đăng nhập.
     *
     * @param int    $userId  ID người dùng cần khóa.
     * @param int    $adminId ID admin thực hiện.
     * @param string $reason  Lý do khóa tài khoản.
     * @throws \Exception Nếu cố khóa tài khoản admin hoặc chính mình.
     */
    public function banUser(int $userId, int $adminId, string $reason): void;

    /**
     * Mở khóa tài khoản người dùng (unban).
     *
     * @param int $userId ID người dùng cần mở khóa.
     */
    public function unbanUser(int $userId): void;

    /**
     * Lấy danh sách bài đăng cho trang quản trị (phân trang, lọc, tìm kiếm).
     *
     * @param int         $perPage Số bản ghi mỗi trang.
     * @param string|null $status  Trạng thái lọc ('active', 'hidden').
     * @param string|null $search  Từ khóa tìm kiếm.
     */
    public function getPosts(int $perPage = 15, ?string $status = null, ?string $search = null);

    /**
     * Ẩn bài đăng vi phạm (hide) — ghi nhận lý do và admin thực hiện.
     *
     * @param int    $postId  ID bài đăng.
     * @param int    $adminId ID admin thực hiện.
     * @param string $reason  Lý do ẩn bài.
     */
    public function hidePost(int $postId, int $adminId, string $reason): void;

    /**
     * Khôi phục bài đăng đã bị ẩn (restore) — chuyển status về 'active'.
     *
     * @param int $postId ID bài đăng.
     */
    public function restorePost(int $postId): void;
}
