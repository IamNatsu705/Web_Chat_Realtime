<?php

namespace App\Services\Auth;

interface AuthServiceInterface
{
    public function register(array $data): array;

    public function login(array $credentials): array;
}
