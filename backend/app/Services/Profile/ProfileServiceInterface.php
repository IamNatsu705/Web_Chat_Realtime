<?php

namespace App\Services\Profile;

use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Interface Service Hồ sơ cá nhân (Profile Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến hồ sơ người dùng:
 * cập nhật thông tin cá nhân, đổi mật khẩu, và lấy danh sách bài đăng.
 */
interface ProfileServiceInterface
{
    /**
     * Cập nhật thông tin hồ sơ cá nhân (tên, bio, MSSV, khoa, avatar).
     *
     * @param User  $user Người dùng cần cập nhật.
     * @param array $data Dữ liệu cập nhật (name, bio, student_id, department, avatar).
     * @return User Instance người dùng sau khi cập nhật.
     */
    public function updateProfile(User $user, array $data): User;

    /**
     * Đổi mật khẩu (yêu cầu nhập mật khẩu cũ để xác thực).
     *
     * @param User  $user Người dùng.
     * @param array $data Dữ liệu đổi mật khẩu (old_password, new_password).
     * @throws \Illuminate\Validation\ValidationException Nếu mật khẩu cũ không đúng.
     */
    public function updatePassword(User $user, array $data): void;

    /**
     * Lấy danh sách bài đăng của người dùng.
     *
     * @param int $userId ID người dùng.
     * @return Collection
     */
    public function getMyPosts(int $userId): Collection;
}
