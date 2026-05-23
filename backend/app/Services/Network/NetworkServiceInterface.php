<?php

namespace App\Services\Network;

interface NetworkServiceInterface
{
    public function sendFriendRequest(int $senderId, int $receiverId);

    public function getIncomingRequests(int $userId);

    public function getFriends(int $userId);

    public function cancelFriendRequest(int $senderId, int $receiverId): void;

    public function respondToRequest(int $requestId, int $currentUserId, string $action): void;

    public function unfriend(int $userId, int $friendId): void;

    public function getSuggestedFriends(int $userId, int $limit = 10);
}
