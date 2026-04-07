<?php

namespace App\Repositories\FriendRequestRepo;

use App\Models\FriendRequest;
use App\Repositories\BaseRepo\BaseRepository;

class FriendRequestRepository extends BaseRepository implements FriendRequestRepositoryInterface
{
    public function getModel(): string
    {
        return FriendRequest::class;
    }

    public function findPendingRequest(int $senderId, int $receiverId)
    {
        return $this->model->where([
            ['sender_id', '=', $senderId],
            ['receiver_id', '=', $receiverId],
            ['status', '=', 'pending'],
        ])->first();
    }

    public function getIncomingRequests(int $userId)
    {
        return $this->model
            ->with('sender')
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findSentRequest(int $senderId, int $receiverId)
    {
        return $this->findPendingRequest($senderId, $receiverId);
    }
}
