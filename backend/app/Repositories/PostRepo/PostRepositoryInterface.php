<?php

namespace App\Repositories\PostRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Support\Collection;

interface PostRepositoryInterface extends BaseRepositoryInterface
{
    public function getByUserId(int $userId): Collection;
}
