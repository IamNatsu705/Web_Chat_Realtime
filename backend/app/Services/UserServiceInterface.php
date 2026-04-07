<?php

namespace App\Services;

interface UserServiceInterface
{
    public function createUser(array $data);
    public function search(array $data, int $currentUserId);
}
