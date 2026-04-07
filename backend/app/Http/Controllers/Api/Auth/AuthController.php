<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthServiceInterface;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected AuthServiceInterface $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token']
        ], 'Đăng ký thành công.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());
        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token']
        ], 'Đăng nhập thành công.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(
            ['user' => new UserResource($request->user())],
            'Lấy thông tin người dùng thành công.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Đăng xuất thành công.');
    }
}
