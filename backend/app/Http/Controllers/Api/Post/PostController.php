<?php

namespace App\Http\Controllers\Api\Post;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\CreateCommentRequest;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Resources\CommentResource;
use App\Http\Resources\PostResource;
use App\Services\Post\PostServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected PostServiceInterface $postService
    ) {}

    public function feed(Request $request): JsonResponse
    {
        $cursor = $request->input('cursor');
        $posts = $this->postService->getFeed($request->user()->id, $cursor);

        return $this->success([
            'posts' => PostResource::collection($posts->items()),
            'next_cursor' => $posts->nextCursor()?->encode(),
            'has_more' => $posts->hasMorePages(),
        ], 'Lấy danh sách bài viết thành công.');
    }

    public function show(Request $request, int $postId): JsonResponse
    {
        $post = $this->postService->getPostById($postId, $request->user()->id);

        return $this->success(
            ['post' => new PostResource($post)],
            'Lấy chi tiết bài viết thành công.'
        );
    }

    public function store(CreatePostRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('media')) {
            $data['media'] = $request->file('media');
        }

        $post = $this->postService->createPost($request->user()->id, $data);

        return $this->success(
            ['post' => new PostResource($post)],
            'Đăng bài viết thành công.',
            201
        );
    }

    public function update(Request $request, int $postId): JsonResponse
    {
        $data = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $post = $this->postService->updatePost($postId, $request->user()->id, $data);

        return $this->success(
            ['post' => new PostResource($post)],
            'Cập nhật bài viết thành công.'
        );
    }

    public function destroy(Request $request, int $postId): JsonResponse
    {
        $this->postService->deletePost($postId, $request->user()->id);

        return $this->success(null, 'Xoá bài viết thành công.');
    }

    public function toggleLike(Request $request, int $postId): JsonResponse
    {
        $result = $this->postService->toggleLike($postId, $request->user()->id);

        return $this->success($result, $result['liked'] ? 'Đã thích bài viết.' : 'Đã bỏ thích bài viết.');
    }

    public function getComments(int $postId): JsonResponse
    {
        $comments = $this->postService->getComments($postId);

        return $this->success([
            'comments' => CommentResource::collection($comments->items()),
            'current_page' => $comments->currentPage(),
            'last_page' => $comments->lastPage(),
        ], 'Lấy danh sách bình luận thành công.');
    }

    public function storeComment(CreateCommentRequest $request, int $postId): JsonResponse
    {
        $comment = $this->postService->createComment(
            $postId,
            $request->user()->id,
            $request->validated()
        );

        return $this->success(
            ['comment' => new CommentResource($comment)],
            'Thêm bình luận thành công.',
            201
        );
    }

    public function updateComment(Request $request, int $commentId): JsonResponse
    {
        $data = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $comment = $this->postService->updateComment($commentId, $request->user()->id, $data);

        return $this->success(
            ['comment' => new CommentResource($comment)],
            'Cập nhật bình luận thành công.'
        );
    }

    public function destroyComment(Request $request, int $commentId): JsonResponse
    {
        $this->postService->deleteComment($commentId, $request->user()->id);

        return $this->success(null, 'Xoá bình luận thành công.');
    }

    public function userPosts(Request $request, int $userId): JsonResponse
    {
        $posts = $this->postService->getUserPosts($userId, $request->user()->id);

        return $this->success([
            'posts' => PostResource::collection($posts->items()),
            'current_page' => $posts->currentPage(),
            'last_page' => $posts->lastPage(),
        ], 'Lấy bài viết của người dùng thành công.');
    }
}
