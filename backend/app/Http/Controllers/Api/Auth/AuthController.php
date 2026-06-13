<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthServiceInterface;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controller Xác thực (Auth Controller).
 *
 * Xử lý các API endpoint liên quan đến xác thực người dùng:
 * đăng ký, đăng nhập, lấy thông tin cá nhân, đăng xuất.
 *
 * Tất cả endpoint trả về chuẩn JSON (ApiResponses trait).
 */
class AuthController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected AuthServiceInterface $authService
    ) {}

    /**
     * POST /api/v1/auth/register
     * Đăng ký tài khoản mới, trả về user + token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token']
        ], 'Đăng ký thành công.', 201);
    }

    /**
     * POST /api/v1/auth/login
     * Đăng nhập bằng email/password, trả về user + token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());
        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token']
        ], 'Đăng nhập thành công.');
    }

    /**
     * GET /api/v1/auth/me
     * Lấy thông tin người dùng đang đăng nhập.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success(
            ['user' => new UserResource($request->user())],
            'Lấy thông tin người dùng thành công.'
        );
    }

    /**
     * POST /api/v1/auth/logout
     * Đăng xuất — xóa token hiện tại.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Đăng xuất thành công.');
    }
}
