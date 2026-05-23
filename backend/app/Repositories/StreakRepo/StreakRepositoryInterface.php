<?php

namespace App\Repositories\StreakRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface StreakRepositoryInterface extends BaseRepositoryInterface
{
    public function getByConversationId(int $conversationId);

    public function getOrCreate(int $conversationId, int $userAId, int $userBId);

    public function getActiveStreaksNeedingCheck();
}
