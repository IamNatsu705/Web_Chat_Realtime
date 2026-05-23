<?php

namespace App\Services\Post;

use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface PostServiceInterface
{
    public function getFeed(int $userId, ?string $cursor): CursorPaginator;

    public function getPostById(int $postId, int $userId): Model;

    public function getUserPosts(int $userId, int $viewerId): LengthAwarePaginator;

    public function createPost(int $userId, array $data): Model;

    public function updatePost(int $postId, int $userId, array $data): Model;

    public function deletePost(int $postId, int $userId): void;

    public function toggleLike(int $postId, int $userId): array;

    public function getComments(int $postId, int $perPage = 15): LengthAwarePaginator;

    public function createComment(int $postId, int $userId, array $data): Model;

    public function updateComment(int $commentId, int $userId, array $data): Model;

    public function deleteComment(int $commentId, int $userId): void;
}
