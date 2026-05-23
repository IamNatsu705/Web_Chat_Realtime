<?php

namespace App\Services\Network;

use App\Events\Network\FriendRequestReceived;
use App\Events\Network\FriendRequestUpdated;
use App\Events\Chat\MessageSent;
use App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface;
use App\Repositories\FriendRequestRepo\FriendRequestRepositoryInterface;
use App\Repositories\FriendshipRepo\FriendshipRepositoryInterface;
use App\Repositories\ConversationRepo\ConversationRepositoryInterface;
use App\Repositories\MessageRepo\MessageRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;

class NetworkService implements NetworkServiceInterface
{
    public function __construct(
        protected FriendRequestRepositoryInterface $friendRequestRepo,
        protected FriendshipRepositoryInterface $friendshipRepo,
        protected ConversationRepositoryInterface $conversationRepo,
        protected MessageRepositoryInterface $messageRepo,
        protected ConversationParticipantRepositoryInterface $participantRepo
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

        $request = $this->friendRequestRepo->create([
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'status'      => 'pending',
        ]);

        broadcast(new FriendRequestReceived($receiverId))->toOthers();

        return $request;
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

        $receiverId = $request->receiver_id;
        $request->delete();
        
        broadcast(new FriendRequestUpdated($receiverId))->toOthers();
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
            $senderId = $friendRequest->sender_id;
            $receiverId = $friendRequest->receiver_id;

            DB::transaction(function () use ($friendRequest, $senderId, $receiverId) {
                $this->friendshipRepo->create([
                    'user_id'   => $senderId,
                    'friend_id' => $receiverId,
                ]);

                $friendRequest->delete();

                // Tự động tạo cuộc trò chuyện + tin nhắn hệ thống khi trở thành bạn bè
                $this->createFriendConversation($senderId, $receiverId);
            });
            broadcast(new FriendRequestUpdated($senderId))->toOthers();
        } else if ($action === 'reject') {
            $senderId = $friendRequest->sender_id;
            $friendRequest->delete();
            broadcast(new FriendRequestUpdated($senderId))->toOthers();
        } else {
            throw new Exception('Hành động này không hợp lệ.');
        }
    }

    /**
     * Khi hai người dùng trở thành bạn bè, tạo (hoặc tái sử dụng) cuộc trò chuyện 1-1
     * và gửi tin nhắn hệ thống "Hai bạn đã trở thành bạn bè".
     * Xử lý luôn chuyển đổi người lạ => bạn bè bằng cách cập nhật trạng thái pending thành active.
     */
    protected function createFriendConversation(int $userId, int $friendId): void
    {
        // Kiểm tra xem cuộc trò chuyện 1-1 đã tồn tại chưa (VD: từ việc nhắn tin người lạ)
        $conversation = $this->conversationRepo->getDirectConversation($userId, $friendId);

        if ($conversation) {
            // Cập nhật trạng thái participant từ pending/rejected thành active (người lạ => bạn bè)
            $this->participantRepo->activateParticipants($conversation->id, [$userId, $friendId]);
        } else {
            // Tạo cuộc trò chuyện mới
            $conversation = $this->conversationRepo->create([
                'is_group' => false,
            ]);

            $this->participantRepo->insertMany([
                ['conversation_id' => $conversation->id, 'user_id' => $userId, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
                ['conversation_id' => $conversation->id, 'user_id' => $friendId, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Tạo tin nhắn hệ thống
        $systemMessage = $this->messageRepo->create([
            'conversation_id' => $conversation->id,
            'sender_id' => null,
            'content' => 'Hai bạn đã trở thành bạn bè 🎉',
            'type' => 'system',
        ]);

        $systemMessage->load('sender');

        // Phát sự kiện tới kênh cá nhân của cả 2 người (user.{id})
        // để cuộc trò chuyện xuất hiện ở sidebar dù họ chưa subscribe chat.{conversationId}.
        $participantIds = [$userId, $friendId];
        broadcast(new MessageSent($systemMessage, $participantIds));
    }

    public function unfriend(int $userId, int $friendId): void
    {
        $deleted = $this->friendshipRepo->deleteFriendship($userId, $friendId);

        if (!$deleted) {
            throw new Exception('Hai người dùng này không phải bạn bè.');
        }
    }

    /**
     * Gợi ý kết bạn thông minh dựa trên Mutual Friends.
     *
     * Tối ưu: Lấy friend IDs + pending request IDs trước (2 query nhẹ),
     * rồi truyền vào repository để chạy 1 query GROUP BY đếm mutual.
     */
    public function getSuggestedFriends(int $userId, int $limit = 10)
    {
        // B1: Lấy danh sách friend IDs hiện tại (indexed query)
        $friendIds = $this->friendshipRepo->getFriendIds($userId);

        // B2: Lấy IDs của những user đang có pending request (cả sent + received)
        // để loại trừ khỏi gợi ý
        $pendingRequestIds = $this->friendRequestRepo
            ->getIncomingRequests($userId)
            ->pluck('sender_id')
            ->merge(
                $this->friendRequestRepo->getSentPendingRequestIds($userId)
            )
            ->unique()
            ->all();

        // B3: Query mutual friends (optimized — xem FriendshipRepository)
        return $this->friendshipRepo->getSuggestedFriends(
            $userId,
            $friendIds,
            $pendingRequestIds,
            $limit
        );
    }
}
