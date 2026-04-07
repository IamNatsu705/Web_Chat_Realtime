<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

interface ProfileServiceInterface
{
    public function updateProfile(User $user, array $data): User;

    public function updatePassword(User $user, array $data): void;

    public function getMyPosts(int $userId): Collection;
}
