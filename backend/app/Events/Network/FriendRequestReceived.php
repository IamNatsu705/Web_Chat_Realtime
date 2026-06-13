<?php

namespace App\Events\Network;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Sự kiện nhận lời mời kết bạn (FriendRequestReceived).
 *
 * Phát qua WebSocket khi có lời mời kết bạn mới.
 * Frontend nhận sự kiện này để cập nhật badge số lời mời chờ xử lý.
 */
class FriendRequestReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $receiverId;

    public function __construct(int $receiverId)
    {
        $this->receiverId = $receiverId;
    }

    /**
     * Broadcast đến kênh riêng của người nhận.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->receiverId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FriendRequestReceived';
    }
}
