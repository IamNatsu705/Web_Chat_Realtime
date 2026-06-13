<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BanUserRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Services\Admin\AdminServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Quản trị (Admin Controller).
 *
 * Xử lý các API endpoint dành cho Quản trị viên:
 * Dashboard thống kê, quản lý người dùng (ban/unban), quản lý bài đăng (ẩn/khôi phục).
 *
 * Tất cả endpoint đều yêu cầu middleware AdminMiddleware (role = 'admin').
 */
class AdminController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected AdminServiceInterface $adminService
    ) {}

    /**
     * GET /api/v1/admin/dashboard
     * Lấy dữ liệu tổng quan cho Dashboard quản trị.
     */
    public function dashboard(): JsonResponse
    {
        $stats = $this->adminService->getDashboardStats();

        return $this->success($stats, 'Lấy thống kê thành công.');
    }

    /**
     * GET /api/v1/admin/users
     * Lấy danh sách người dùng (phân trang, tìm kiếm, lọc trạng thái).
     */
    public function getUsers(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $users = $this->adminService->getUsers(10, $search, $status);

        return $this->success([
            'users' => UserResource::collection($users->items()),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'total' => $users->total(),
        ], 'Lấy danh sách người dùng thành công.');
    }

    /**
     * POST /api/v1/admin/users/{userId}/ban
     * Khóa tài khoản người dùng.
     */
    public function banUser(BanUserRequest $request, int $userId): JsonResponse
    {
        $this->adminService->banUser($userId, (int) auth()->id(), $request->input('reason'));

        return $this->success(null, 'Đã khoá tài khoản.');
    }

    /**
     * POST /api/v1/admin/users/{userId}/unban
     * Mở khóa tài khoản người dùng.
     */
    public function unbanUser(int $userId): JsonResponse
    {
        $this->adminService->unbanUser($userId);

        return $this->success(null, 'Đã mở khoá tài khoản.');
    }

    /**
     * GET /api/v1/admin/posts
     * Lấy danh sách bài đăng (phân trang, lọc trạng thái, tìm kiếm).
     */
    public function getPosts(Request $request): JsonResponse
    {
        $status = $request->input('status');
        $search = $request->input('search');
        $posts = $this->adminService->getPosts(10, $status, $search);

        return $this->success([
            'posts' => PostResource::collection($posts->items()),
            'current_page' => $posts->currentPage(),
            'last_page' => $posts->lastPage(),
            'total' => $posts->total(),
        ], 'Lấy danh sách bài viết thành công.');
    }

    /**
     * POST /api/v1/admin/posts/{postId}/hide
     * Ẩn bài đăng vi phạm.
     */
    public function hidePost(Request $request, int $postId): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ]);

        $this->adminService->hidePost($postId, (int) auth()->id(), $request->input('reason'));

        return $this->success(null, 'Đã ẩn bài viết.');
    }

    /**
     * POST /api/v1/admin/posts/{postId}/restore
     * Khôi phục bài đăng đã bị ẩn.
     */
    public function restorePost(int $postId): JsonResponse
    {
        $this->adminService->restorePost($postId);

        return $this->success(null, 'Đã khôi phục bài viết.');
    }
}
