<?php

namespace App\Services\User;

use App\Models\User;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class UserService implements UserServiceInterface
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

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

    public function search(array $data, int $currentUserId)
    {
        return $this->userRepository->searchByKeyword($data['keyword'], $currentUserId);
    }

    public function getUserById(int $userId): User
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);
        return $user;
    }
}
