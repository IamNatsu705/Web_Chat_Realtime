<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponses;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware kiểm tra quyền Quản trị viên.
 *
 * Chặn truy cập nếu người dùng không có role 'admin'.
 * Trả về lỗi 403 (Forbidden) với JSON chuẩn.
 */
class AdminMiddleware
{
    use ApiResponses;

    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return $this->error('Bạn không có quyền truy cập.', 403);
        }

        return $next($request);
    }
}
