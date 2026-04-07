<?php

namespace App\Repositories\FriendRequestRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface FriendRequestRepositoryInterface extends BaseRepositoryInterface
{
    public function findPendingRequest(int $senderId, int $receiverId);
    public function getIncomingRequests(int $receiverId);
    public function findSentRequest(int $senderId, int $receiverId);
}
