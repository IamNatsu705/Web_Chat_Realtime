<?php

namespace App\Repositories\ConversationRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface ConversationRepositoryInterface extends BaseRepositoryInterface
{
    public function getUserConversations(int $userId);
    public function getDirectConversation(int $userId, int $friendId);
}
