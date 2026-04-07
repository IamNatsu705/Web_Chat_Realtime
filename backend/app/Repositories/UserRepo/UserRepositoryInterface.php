<?php

namespace App\Repositories\UserRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * @param string $email
     * @return \App\Models\User|null
     */
    public function findByEmail(string $email);
    public function searchByKeyword(string $keyword, int $currentUserId);
}
