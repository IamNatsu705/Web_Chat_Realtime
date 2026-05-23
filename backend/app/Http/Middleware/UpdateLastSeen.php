<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * UpdateLastSeen — Tự động cập nhật `last_seen_at` khi user gọi API.
 *
 * Throttle: chỉ update nếu > 1 phút kể từ lần cuối.
 * Tránh gây tải database khi user liên tục gọi API trong thời gian ngắn.
 */
class UpdateLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Chỉ update cho authenticated users
        $user = Auth::user();
        if (!$user) {
            return $response;
        }

        // Throttle: skip nếu last_seen_at < 1 phút trước
        $lastSeen = $user->last_seen_at;
        if ($lastSeen && $lastSeen->diffInSeconds(now()) < 60) {
            return $response;
        }

        // Update silently (không trigger events, không touch timestamps)
        $user->forceFill(['last_seen_at' => now()])->saveQuietly();

        return $response;
    }
}
