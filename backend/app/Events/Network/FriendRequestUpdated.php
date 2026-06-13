<?php

namespace App\Events\Network;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Sự kiện cập nhật lời mời kết bạn (FriendRequestUpdated).
 *
 * Phát qua WebSocket khi lời mời kết bạn được chấp nhận, từ chối, hoặc hủy.
 * Frontend nhận sự kiện này để cập nhật trạng thái quan hệ trên UI.
 */
class FriendRequestUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $receiverId;

    public function __construct(int $receiverId)
    {
        $this->receiverId = $receiverId;
    }

    /**
     * Broadcast đến kênh riêng của người nhận thông báo.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->receiverId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FriendRequestUpdated';
    }
}
