<?php

namespace App\Repositories\PostCommentRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PostCommentRepositoryInterface extends BaseRepositoryInterface
{
    public function getByPostId(int $postId, int $perPage = 15): LengthAwarePaginator;
}
