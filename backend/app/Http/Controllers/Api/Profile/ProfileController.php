<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Services\ProfileServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected ProfileServiceInterface $profileService
    ) {}

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

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $this->profileService->updatePassword(
            $request->user(),
            $request->validated()
        );

        return $this->success(null, 'Đổi mật khẩu thành công.');
    }

    public function getMyPosts(Request $request): JsonResponse
    {
        $posts = $this->profileService->getMyPosts($request->user()->id);

        return $this->success(
            ['posts' => PostResource::collection($posts)],
            'Lấy danh sách bài đăng thành công.'
        );
    }
}
