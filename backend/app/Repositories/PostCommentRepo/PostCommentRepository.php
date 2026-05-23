<?php

namespace App\Repositories\PostCommentRepo;

use App\Models\PostComment;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostCommentRepository extends BaseRepository implements PostCommentRepositoryInterface
{
    public function getModel(): string
    {
        return PostComment::class;
    }

    public function getByPostId(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->with(['user', 'replies.user'])
            ->withCount('replies')
            ->where('post_id', $postId)
            ->whereNull('parent_id') // Only top-level comments
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
