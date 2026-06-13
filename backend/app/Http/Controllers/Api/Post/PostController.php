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

/**
 * Controller Bài đăng (Post Controller).
 *
 * Xử lý các API endpoint liên quan đến bài đăng:
 * bảng tin (feed), CRUD bài viết, lượt thích, bình luận.
 */
class PostController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected PostServiceInterface $postService
    ) {}

    /**
     * GET /api/v1/posts/feed
     * Lấy bảng tin (feed) với phân trang cursor.
     */
    public function feed(Request $request): JsonResponse
    {
        $cursor = $request->input('cursor');
        $posts = $this->postService->getFeed((int) auth()->id(), $cursor);

        return $this->success([
            'posts' => PostResource::collection($posts->items()),
            'next_cursor' => $posts->nextCursor()?->encode(),
            'has_more' => $posts->hasMorePages(),
        ], 'Lấy danh sách bài viết thành công.');
    }

    /**
     * GET /api/v1/posts/{postId}
     * Lấy chi tiết bài đăng.
     */
    public function show(Request $request, int $postId): JsonResponse
    {
        $post = $this->postService->getPostById($postId, (int) auth()->id());

        return $this->success(
            ['post' => new PostResource($post)],
            'Lấy chi tiết bài viết thành công.'
        );
    }

    /**
     * POST /api/v1/posts
     * Tạo bài đăng mới (hỗ trợ đính kèm ảnh/video).
     */
    public function store(CreatePostRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('media')) {
            $data['media'] = $request->file('media');
        }

        $post = $this->postService->createPost((int) auth()->id(), $data);

        return $this->success(
            ['post' => new PostResource($post)],
            'Đăng bài viết thành công.',
            201
        );
    }

    /**
     * PUT /api/v1/posts/{postId}
     * Cập nhật nội dung bài đăng.
     */
    public function update(Request $request, int $postId): JsonResponse
    {
        $data = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $post = $this->postService->updatePost($postId, (int) auth()->id(), $data);

        return $this->success(
            ['post' => new PostResource($post)],
            'Cập nhật bài viết thành công.'
        );
    }

    /**
     * DELETE /api/v1/posts/{postId}
     * Xóa bài đăng.
     */
    public function destroy(Request $request, int $postId): JsonResponse
    {
        $this->postService->deletePost($postId, (int) auth()->id());

        return $this->success(null, 'Xoá bài viết thành công.');
    }

    /**
     * POST /api/v1/posts/{postId}/like
     * Thích/bỏ thích bài đăng (toggle).
     */
    public function toggleLike(Request $request, int $postId): JsonResponse
    {
        $result = $this->postService->toggleLike($postId, (int) auth()->id());

        return $this->success($result, $result['liked'] ? 'Đã thích bài viết.' : 'Đã bỏ thích bài viết.');
    }

    /**
     * GET /api/v1/posts/{postId}/comments
     * Lấy danh sách bình luận của bài đăng.
     */
    public function getComments(int $postId): JsonResponse
    {
        $comments = $this->postService->getComments($postId);

        return $this->success([
            'comments' => CommentResource::collection($comments->items()),
            'current_page' => $comments->currentPage(),
            'last_page' => $comments->lastPage(),
        ], 'Lấy danh sách bình luận thành công.');
    }

    /**
     * POST /api/v1/posts/{postId}/comments
     * Thêm bình luận mới.
     */
    public function storeComment(CreateCommentRequest $request, int $postId): JsonResponse
    {
        $comment = $this->postService->createComment(
            $postId,
            (int) auth()->id(),
            $request->validated()
        );

        return $this->success(
            ['comment' => new CommentResource($comment)],
            'Thêm bình luận thành công.',
            201
        );
    }

    /**
     * PUT /api/v1/posts/comments/{commentId}
     * Cập nhật nội dung bình luận.
     */
    public function updateComment(Request $request, int $commentId): JsonResponse
    {
        $data = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $comment = $this->postService->updateComment($commentId, (int) auth()->id(), $data);

        return $this->success(
            ['comment' => new CommentResource($comment)],
            'Cập nhật bình luận thành công.'
        );
    }

    /**
     * DELETE /api/v1/posts/comments/{commentId}
     * Xóa bình luận.
     */
    public function destroyComment(Request $request, int $commentId): JsonResponse
    {
        $this->postService->deleteComment($commentId, (int) auth()->id());

        return $this->success(null, 'Xoá bình luận thành công.');
    }

    /**
     * GET /api/v1/posts/users/{userId}
     * Lấy bài viết của một người dùng (trang cá nhân).
     */
    public function userPosts(Request $request, int $userId): JsonResponse
    {
        $posts = $this->postService->getUserPosts($userId, (int) auth()->id());

        return $this->success([
            'posts' => PostResource::collection($posts->items()),
            'current_page' => $posts->currentPage(),
            'last_page' => $posts->lastPage(),
        ], 'Lấy bài viết của người dùng thành công.');
    }
}
