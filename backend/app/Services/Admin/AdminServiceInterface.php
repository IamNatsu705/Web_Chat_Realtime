<?php

namespace App\Services\Admin;

interface AdminServiceInterface
{
    public function getDashboardStats(): array;

    public function getUsers(int $perPage = 15, ?string $search = null, ?string $status = null);

    public function banUser(int $userId, int $adminId, string $reason): void;

    public function unbanUser(int $userId): void;

    public function getPosts(int $perPage = 15, ?string $status = null, ?string $search = null);

    public function hidePost(int $postId, int $adminId, string $reason): void;

    public function restorePost(int $postId): void;
}
