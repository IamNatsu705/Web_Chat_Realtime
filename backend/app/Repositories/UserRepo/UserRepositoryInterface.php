<?php

namespace App\Repositories\UserRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * @param string $email
     * @return \App\Models\User|null
     */
    public function findByEmail(string $email);

    public function searchByKeyword(string $keyword, int $currentUserId);

    public function countAll(): int;

    public function countSince(Carbon $date): int;

    public function countBanned(): int;

    public function getForAdmin(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator;

    public function countBetween(Carbon $from, Carbon $to): int;

    public function getMostActive(int $limit = 5): \Illuminate\Support\Collection;

    public function countActiveToday(): int;

    public function getDailyCount(int $days = 7): array;
}
