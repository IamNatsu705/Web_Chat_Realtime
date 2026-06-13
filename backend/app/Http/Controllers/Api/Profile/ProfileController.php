<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Services\Profile\ProfileServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Hồ sơ cá nhân (Profile Controller).
 *
 * Xử lý các API endpoint liên quan đến hồ sơ người dùng:
 * cập nhật thông tin, đổi mật khẩu, lấy bài đăng của mình.
 */
class ProfileController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected ProfileServiceInterface $profileService
    ) {}

    /**
     * PUT /api/v1/profile
     * Cập nhật thông tin hồ sơ cá nhân (tên, bio, MSSV, khoa, avatar).
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->profileService->updateProfile(
            $request->user(),
            $request->validated() + ['avatar' => $request->file('avatar')]
        );

        return $this->success(
            ['user' => new UserResource($user)],
            'Cập nhật profile thành công.'
        );
    }

    /**
     * PUT /api/v1/profile/password
     * Đổi mật khẩu (yêu cầu nhập mật khẩu cũ).
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $this->profileService->updatePassword(
            $request->user(),
            $request->validated()
        );

        return $this->success(null, 'Đổi mật khẩu thành công.');
    }

    /**
     * GET /api/v1/profile/posts
     * Lấy danh sách bài đăng của mình.
     */
    public function getMyPosts(Request $request): JsonResponse
    {
        $posts = $this->profileService->getMyPosts((int) auth()->id());

        return $this->success(
            ['posts' => PostResource::collection($posts)],
            'Lấy danh sách bài đăng thành công.'
        );
    }
}
