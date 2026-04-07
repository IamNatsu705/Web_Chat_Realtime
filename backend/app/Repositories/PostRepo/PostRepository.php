<?php

namespace App\Repositories\PostRepo;

use App\Models\Post;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Support\Collection;

class PostRepository extends BaseRepository implements PostRepositoryInterface
{
    public function getModel(): string
    {
        return Post::class;
    }

    public function getByUserId(int $userId): Collection
    {
        return $this->model
            ->with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
