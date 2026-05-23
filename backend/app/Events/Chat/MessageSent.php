<?php

namespace App\Events\Chat;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $conversationId;
    public $participantIds;

    public function __construct(Message $message, array $participantIds = [])
    {
        // Use resolve() to get a plain array – avoids SerializesModels
        // trying to serialize a JsonResource object.
        $this->message = (new MessageResource($message))->resolve();
        $this->conversationId = $message->conversation_id;
        $this->participantIds = $participantIds;
    }

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
