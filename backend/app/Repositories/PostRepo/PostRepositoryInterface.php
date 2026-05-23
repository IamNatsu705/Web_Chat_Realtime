<?php

namespace App\Repositories\PostRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PostRepositoryInterface extends BaseRepositoryInterface
{
    public function getByUserId(int $userId): Collection;

    public function getFeed(int $perPage = 15, ?string $cursor = null): CursorPaginator;

    public function getUserPosts(int $userId, int $viewerId, int $perPage = 15): LengthAwarePaginator;

    public function getForAdmin(int $perPage = 15, ?string $status = null, ?string $search = null): LengthAwarePaginator;

    public function countAll(): int;

    public function countSince(\Carbon\Carbon $date): int;

    public function countBetween(\Carbon\Carbon $from, \Carbon\Carbon $to): int;

    public function countHidden(): int;

    public function getTopEngagement(int $limit = 5): \Illuminate\Support\Collection;

    public function getDailyCount(int $days = 7): array;
}
