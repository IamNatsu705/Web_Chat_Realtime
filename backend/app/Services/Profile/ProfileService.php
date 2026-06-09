<?php

namespace App\Services\Profile;

use App\Models\User;
use App\Repositories\PostRepo\PostRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileService implements ProfileServiceInterface
{
    public function __construct(
        protected PostRepositoryInterface $postRepository
    ) {}

    public function updateProfile(User $user, array $data): User
    {
        $updateData = ['name' => $data['name']];

        // Cập nhật thông tin sinh viên PTIT
        if (array_key_exists('bio', $data)) {
            $updateData['bio'] = $data['bio'];
        }
        if (array_key_exists('student_id', $data)) {
            $updateData['student_id'] = $data['student_id'];
        }
        if (array_key_exists('department', $data)) {
            $updateData['department'] = $data['department'];
        }

        if (!empty($data['avatar'])) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $data['avatar']->store('avatars', 'public');
            $updateData['avatar'] = $path;
        }

        $user->update($updateData);

        return $user->fresh();
    }
    public function updatePassword(User $user, array $data): void
    {
        if (!Hash::check($data['old_password'], $user->password)) {
            throw ValidationException::withMessages([
                'old_password' => ['Mật khẩu hiện tại không chính xác.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($data['new_password']),
        ]);
    }

    public function getMyPosts(int $userId): Collection
    {
        return $this->postRepository->getByUserId($userId);
    }
}
