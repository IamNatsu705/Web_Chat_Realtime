<?php

namespace App\Events\Chat;

use App\Models\Streak;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StreakUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $streak;
    public int $conversationId;
    public array $participantIds;

    public function __construct(Streak $streak, array $participantIds)
    {
        $this->streak = [
            'conversation_id' => $streak->conversation_id,
            'current_streak'  => $streak->current_streak,
            'status'          => $streak->status,
            'restore_days'    => $streak->restore_days,
            'tier'            => $streak->getMilestoneTier(),
            'is_milestone'    => $streak->isMilestone(),
            'today_completed' => $streak->last_completed_date
                && $streak->last_completed_date->isToday(),
        ];
        $this->conversationId = $streak->conversation_id;
        $this->participantIds = $participantIds;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'StreakUpdated';
    }
}
