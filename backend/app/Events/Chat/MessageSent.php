<?php

namespace App\Events\Chat;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Sự kiện gửi tin nhắn (MessageSent).
 *
 * Phát qua WebSocket khi có tin nhắn mới.
 * Broadcast đến 2 loại kênh:
 * - chat.{conversationId}: cho người đang mở cuộc trò chuyện.
 * - user.{userId}: cho sidebar hiển thị tin nhắn mới ở cuộc trò chuyện khác.
 */
class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $conversationId;
    public $participantIds;

    public function __construct(Message $message, array $participantIds = [])
    {
        // Dùng resolve() để lấy mảng thuần — tránh SerializesModels serialize JsonResource
        $this->message = (new MessageResource($message))->resolve();
        $this->conversationId = $message->conversation_id;
        $this->participantIds = $participantIds;
    }

    /**
     * Broadcast đến kênh cuộc trò chuyện + kênh riêng của từng thành viên.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('chat.' . $this->conversationId),
        ];

        foreach ($this->participantIds as $userId) {
            $channels[] = new PrivateChannel('user.' . $userId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
