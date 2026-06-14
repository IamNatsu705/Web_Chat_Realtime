<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Sự kiện đánh dấu đã đọc (MessageRead).
 *
 * Phát qua WebSocket khi người dùng đọc tin nhắn trong cuộc trò chuyện.
 * Frontend nhận sự kiện này để cập nhật trạng thái "Đã xem" cho người gửi.
 */
class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversationId;
    public $userId;

    public function __construct(int $conversationId, int $userId)
    {
        $this->conversationId = $conversationId;
        $this->userId = $userId;
    }

    /**
     * Broadcast đến kênh cuộc trò chuyện.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageRead';
    }
}
