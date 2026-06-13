<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Người dùng (User Resource).
 *
 * Biến đổi model User thành JSON cho API response.
 * Phân quyền dữ liệu theo ngữ cảnh:
 * - Thông tin public: tên, avatar, bio, MSSV, khoa (ai cũng thấy).
 * - Thông tin private: email, role, ngày tạo (chỉ chủ tài khoản hoặc admin thấy).
 * - Thông tin admin: trạng thái ban (chỉ admin thấy).
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAuthUser = $request->user() && $request->user()->id === $this->id;
        $isAdmin = $request->user() && $request->user()->isAdmin();
        $isLoginOrRegister = $request->is('api/*/auth/login') || $request->is('api/*/auth/register');
        $shouldShowPrivate = $isAuthUser || $isAdmin || $isLoginOrRegister;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'last_seen_at' => $this->last_seen_at,

            // Thông tin sinh viên PTIT (public — ai cũng thấy)
            'bio' => $this->bio,
            'student_id' => $this->student_id,
            'department' => $this->department,

            // Thông tin quan hệ bạn bè (chỉ có khi tìm kiếm)
            'relationship_status' => $this->relationship_status ?? 'none',
            'friend_request_id' => $this->friend_request_id,
            'is_sender' => (bool) $this->is_sender,

            // Số bạn chung (chỉ có trong response gợi ý kết bạn)
            'mutual_friends_count' => $this->when(isset($this->mutual_friends_count), $this->mutual_friends_count ?? 0),

            // Thông tin riêng tư (chỉ chủ tài khoản, admin, hoặc response đăng nhập/đăng ký)
            'email' => $this->when($shouldShowPrivate, $this->email),
            'role' => $this->when($shouldShowPrivate, $this->role),
            'created_at' => $this->when($shouldShowPrivate, $this->created_at),
            'updated_at' => $this->when($shouldShowPrivate, $this->updated_at),

            // Thông tin dành cho admin
            'is_banned' => $this->when($isAdmin, $this->is_banned),
            'banned_at' => $this->when($isAdmin, $this->banned_at),
            'ban_reason' => $this->when($isAdmin, $this->ban_reason),
        ];
    }
}
