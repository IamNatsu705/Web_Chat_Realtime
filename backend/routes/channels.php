<?php

use Illuminate\Support\Facades\Broadcast;

/**
 * Đăng ký các kênh WebSocket (Broadcasting Channels).
 *
 * Sử dụng Laravel Echo + Pusher/Reverb cho real-time communication.
 * Tất cả kênh đều yêu cầu xác thực Sanctum.
 */

Broadcast::routes(['middleware' => ['auth:sanctum']]);

/**
 * Kênh riêng tư user.{id} — mỗi user chỉ được truy cập kênh của chính mình.
 * Dùng để nhận: tin nhắn mới (sidebar), lời mời kết bạn, cập nhật Streak.
 */
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/**
 * Kênh riêng tư chat.{conversationId} — chỉ thành viên cuộc trò chuyện mới được truy cập.
 * Dùng để nhận: tin nhắn real-time, trạng thái đã đọc, thu hồi tin nhắn.
 */
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    return \App\Models\ConversationParticipant::where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();
});

/**
 * Kênh Presence: theo dõi trạng thái online/offline.
 *
 * Frontend sử dụng Echo.join('presence.online') để subscribe.
 * Laravel tự động broadcast sự kiện "here", "joining", "leaving"
 * để client biết ai đang online.
 */
Broadcast::channel('presence.online', function ($user) {
    // Trả về thông tin user sẽ được broadcast đến tất cả subscribers
    return [
        'id'           => $user->id,
        'name'         => $user->name,
        'avatar'       => $user->avatar,
        'last_seen_at' => $user->last_seen_at?->toISOString(),
    ];
});
