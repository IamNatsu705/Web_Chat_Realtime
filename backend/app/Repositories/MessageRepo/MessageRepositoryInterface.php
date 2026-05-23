<?php

namespace App\Repositories\MessageRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface MessageRepositoryInterface extends BaseRepositoryInterface
{
    public function getMessagesByConversationId(int $conversationId, int $userId, int $limit, ?string $cursor);
    public function markMessagesAsRead(int $conversationId, int $userId);
    public function markGroupMessagesAsRead(int $conversationId, int $userId);

    public function countAll(): int;

    public function getDailyCount(int $days = 7): array;
}
