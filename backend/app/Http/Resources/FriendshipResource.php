<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Quan hệ bạn bè (Friendship Resource).
 *
 * Biến đổi model Friendship thành JSON cho API response.
 * Tự động xác định người bạn dựa trên ID người dùng đang đăng nhập
 * (vì bảng friendships lưu cả user_id và friend_id).
 */
class FriendshipResource extends JsonResource
{
    /**
     * Biến đổi quan hệ bạn bè thành mảng dữ liệu.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $authUserId = $request->user()?->id ?? 0;

        // Xác định người bạn: nếu user_id = mình → lấy friend, ngược lại lấy user
        $friendData = ($this->user_id === $authUserId)
            ? $this->friend
            : $this->user;

        return [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'friend' => new UserResource($friendData),
        ];
    }
}
