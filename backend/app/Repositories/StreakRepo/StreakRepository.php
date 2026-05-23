<?php

namespace App\Repositories\StreakRepo;

use App\Models\Streak;
use App\Repositories\BaseRepo\BaseRepository;
use Carbon\Carbon;

class StreakRepository extends BaseRepository implements StreakRepositoryInterface
{
    public function getModel()
    {
        return Streak::class;
    }

    public function getByConversationId(int $conversationId)
    {
        return $this->model->where('conversation_id', $conversationId)->first();
    }

    public function getOrCreate(int $conversationId, int $userAId, int $userBId)
    {
        return $this->model->firstOrCreate(
            ['conversation_id' => $conversationId],
            [
                'user_a_id' => min($userAId, $userBId),
                'user_b_id' => max($userAId, $userBId),
                'current_streak' => 0,
                'restore_days' => 0,
                'status' => 'active',
            ]
        );
    }



    /**
     * Lấy tất cả streak đang hoạt động/chờ khôi phục có current_streak > 0,
     * và last_completed_date trước ngày hôm nay (có khả năng bị lỡ ngày).
     */
    public function getActiveStreaksNeedingCheck()
    {
        $today = Carbon::today();

        return $this->model
            ->where('current_streak', '>', 0)
            ->where('status', '!=', 'lost')
            ->where(function ($query) use ($today) {
                $query->whereNull('last_completed_date')
                      ->orWhere('last_completed_date', '<', $today);
            })
            ->get();
    }
}
