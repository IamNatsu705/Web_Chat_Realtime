<?php

namespace App\Services;

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
        ]);

        return $user;
    }

    public function search(array $data, int $currentUserId)
    {
        return $this->userRepository->searchByKeyword($data['keyword'], $currentUserId);
    }
}
