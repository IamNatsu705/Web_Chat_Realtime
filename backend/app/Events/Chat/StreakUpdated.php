<?php

namespace App\Events\Chat;

use App\Models\Streak;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Sự kiện cập nhật chuỗi nhắn tin (StreakUpdated).
 *
 * Phát qua WebSocket khi Streak thay đổi (tăng streak, đạt milestone, hết hạn...).
 * Broadcast đến kênh chat.{id} + user.{id} để cả sidebar và khung chat nhận được.
 */
class StreakUpdated implements ShouldBroadcastNow
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

    /**
     * Broadcast đến kênh chat + kênh riêng của từng thành viên.
     * Để sidebar nhận cập nhật streak dù user đang xem cuộc trò chuyện khác.
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
        return 'StreakUpdated';
    }
}
