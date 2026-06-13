<?php

namespace App\Services\User;

use App\Models\User;

/**
 * Interface Service Người dùng (User Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến người dùng:
 * tạo tài khoản, tìm kiếm, và lấy thông tin chi tiết.
 */
interface UserServiceInterface
{
    /**
     * Tạo người dùng mới (hash mật khẩu, lưu thông tin sinh viên).
     *
     * @param array $data Dữ liệu người dùng (name, email, password, student_id, department).
     * @return User Instance người dùng vừa tạo.
     */
    public function createUser(array $data): User;

    /**
     * Tìm kiếm người dùng theo từ khóa, kèm thông tin trạng thái quan hệ.
     *
     * @param array $data          Dữ liệu tìm kiếm (chứa 'keyword').
     * @param int   $currentUserId ID người dùng đang tìm kiếm.
     */
    public function search(array $data, int $currentUserId);

    /**
     * Lấy thông tin người dùng theo ID (ném Exception nếu không tìm thấy).
     *
     * @param int $userId ID người dùng.
     * @return User
     */
    public function getUserById(int $userId): User;
}
