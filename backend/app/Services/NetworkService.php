<?php

namespace App\Services;

use App\Repositories\UserRepo\UserRepositoryInterface;
use App\Repositories\FriendRequestRepo\FriendRequestRepositoryInterface;
use App\Repositories\FriendShipRepo\FriendShipRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;

class NetworkService implements NetworkServiceInterface
{
    public function __construct(
        protected UserRepositoryInterface $userRepo,
        protected FriendRequestRepositoryInterface $friendRequestRepo,
        protected FriendShipRepositoryInterface $friendshipRepo
    ) {}

    public function sendFriendRequest(int $senderId, int $receiverId)
    {
        $isFriend = $this->friendshipRepo->checkIsFriend($senderId, $receiverId);
        if ($isFriend) {
            throw new Exception('Hai bạn đã là bạn bè.');
        }

        $incoming = $this->friendRequestRepo->findPendingRequest($receiverId, $senderId);
        if ($incoming) {
            throw new Exception('Người này đã gửi lời mời cho bạn rồi.');
        }

        $outgoing = $this->friendRequestRepo->findPendingRequest($senderId, $receiverId);
        if ($outgoing) {
            throw new Exception('Bạn đã gửi lời mời rồi.');
        }

        return $this->friendRequestRepo->create([
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'status'      => 'pending',
        ]);
    }

    public function getIncomingRequests(int $userId)
    {
        return $this->friendRequestRepo->getIncomingRequests($userId);
    }

    public function getFriends(int $userId)
    {
        return $this->friendshipRepo->getFriendsByUserId($userId);
    }

    public function cancelFriendRequest(int $senderId, int $receiverId): void
    {
        $request = $this->friendRequestRepo->findSentRequest($senderId, $receiverId);

        if (!$request) {
            throw new Exception('Lời mời kết bạn không tồn tại hoặc đã bị hủy.');
        }

        $request->delete();
    }

    public function respondToRequest(int $requestId, int $currentUserId, string $action): void
    {
        $friendRequest = $this->friendRequestRepo->findOrFail($requestId);

        if ($friendRequest->receiver_id !== $currentUserId) {
            throw new Exception('Bạn không có quyền thực hiện hành động này.');
        }

        if ($friendRequest->status !== 'pending') {
            throw new Exception('Lời mời kết bạn này đã được xử lý rồi.');
        }

        if ($action === 'accept') {
            DB::transaction(function () use ($friendRequest) {
                $this->friendshipRepo->create([
                    'user_id'   => $friendRequest->sender_id,
                    'friend_id' => $friendRequest->receiver_id,
                ]);

                $friendRequest->delete();
            });
        } else if ($action === 'reject') {
            $friendRequest->delete();
        } else {
            throw new Exception('Hành động này không hợp lệ.');
        }
    }

    public function unfriend(int $userId, int $friendId): void
    {
        $deleted = $this->friendshipRepo->deleteFriendship($userId, $friendId);

        if (!$deleted) {
            throw new Exception('Hai người dùng này không phải bạn bè.');
        }
    }
}
