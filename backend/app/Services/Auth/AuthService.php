<?php

namespace App\Services\Auth;

use App\Repositories\UserRepo\UserRepositoryInterface;
use App\Services\User\UserServiceInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Service Xác thực (Auth Service).
 *
 * Xử lý nghiệp vụ đăng ký và đăng nhập.
 * Sử dụng Laravel Sanctum để tạo Personal Access Token cho API authentication.
 */
class AuthService implements AuthServiceInterface
{
    public function __construct(
        protected UserServiceInterface $userService,
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Đăng ký tài khoản mới.
     * Tạo user qua UserService, sau đó tạo token Sanctum.
     */
    public function register(array $data): array
    {
        $user = $this->userService->createUser($data);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Đăng nhập bằng email/password.
     * Kiểm tra thông tin, kiểm tra tài khoản bị khóa, xóa token cũ và tạo token mới.
     */
    public function login(array $credentials): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        // Chặn đăng nhập nếu tài khoản bị khóa bởi admin
        if ($user->is_banned) {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản đã bị khóa. Lý do: ' . ($user->ban_reason ?? 'Vi phạm nội quy cộng đồng.')],
            ]);
        }

        // Xóa tất cả token cũ để đảm bảo chỉ có 1 phiên đăng nhập
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
