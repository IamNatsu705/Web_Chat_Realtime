<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    return \App\Models\ConversationParticipant::where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();
});

// ─── Presence Channel: Theo dõi user online/offline ────────────────────────
// FE sử dụng Echo.join('presence.online') để subscribe.
// Khi một user join channel này, Laravel tự động broadcast "here", "joining", "leaving" events.
Broadcast::channel('presence.online', function ($user) {
    // Trả về thông tin user sẽ được broadcast đến tất cả subscribers
    return [
        'id'           => $user->id,
        'name'         => $user->name,
        'avatar'       => $user->avatar,
        'last_seen_at' => $user->last_seen_at?->toISOString(),
    ];
});
