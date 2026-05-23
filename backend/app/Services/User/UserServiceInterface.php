<?php

namespace App\Services\User;

use App\Models\User;

interface UserServiceInterface
{
    public function createUser(array $data): User;

    public function search(array $data, int $currentUserId);

    public function getUserById(int $userId): User;
}
