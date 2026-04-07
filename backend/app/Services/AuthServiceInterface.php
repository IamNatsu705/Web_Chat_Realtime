<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

interface AuthServiceInterface
{
    public function register(array $data): array;

    public function login(array $credentials): array;
}
