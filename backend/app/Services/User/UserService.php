<?php

namespace App\Services\User;

use App\Models\User;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

/**
 * Service Người dùng (User Service).
 *
 * Xử lý nghiệp vụ liên quan đến người dùng: tạo tài khoản, tìm kiếm, lấy thông tin.
 */
class UserService implements UserServiceInterface
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Tạo người dùng mới với mật khẩu đã được hash.
     */
    public function createUser(array $data): User
    {
        /** @var User $user */
        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'student_id' => $data['student_id'] ?? null,
            'department' => $data['department'] ?? null,
        ]);

        return $user;
    }

    /**
     * Tìm kiếm người dùng theo từ khóa (delegate sang Repository).
     */
    public function search(array $data, int $currentUserId)
    {
        return $this->userRepository->searchByKeyword($data['keyword'], $currentUserId);
    }

    /**
     * Lấy thông tin người dùng theo ID.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Nếu không tìm thấy.
     */
    public function getUserById(int $userId): User
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);
        return $user;
    }
}
