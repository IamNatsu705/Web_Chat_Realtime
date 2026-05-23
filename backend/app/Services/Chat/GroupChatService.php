<?php

namespace App\Services\Chat;

use App\Events\Chat\GroupUpdated;
use App\Events\Chat\MessageSent;
use App\Repositories\ConversationRepo\ConversationRepositoryInterface;
use App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface;
use App\Repositories\FriendshipRepo\FriendshipRepositoryInterface;
use App\Repositories\MessageRepo\MessageRepositoryInterface;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class GroupChatService implements GroupChatServiceInterface
{
    public function __construct(
        protected ConversationRepositoryInterface $conversationRepository,
        protected ConversationParticipantRepositoryInterface $participantRepository,
        protected FriendshipRepositoryInterface $friendshipRepository,
        protected UserRepositoryInterface $userRepository,
        protected MessageRepositoryInterface $messageRepository,
    ) {}

    public function createGroup(int $userId, array $data)
    {
        DB::beginTransaction();
        try {
            $conversationData = [
                'name' => $data['name'],
                'is_group' => true,
                'admin_id' => $userId,
            ];

            if (isset($data['avatar'])) {
                $conversationData['avatar'] = $data['avatar']->store('avatars', 'public');
            }

            $conversation = $this->conversationRepository->create($conversationData);

            // Validate thành viên phải là bạn của creator
            $validMemberIds = [$userId];
            foreach ($data['member_ids'] as $memberId) {
                if ($memberId == $userId) continue;
                $isFriend = $this->friendshipRepository->checkIsFriend($userId, $memberId);
                if (!$isFriend) {
                    throw new Exception("Bạn chỉ có thể thêm bạn bè vào nhóm. User ID $memberId không phải bạn bè.");
                }
                $validMemberIds[] = $memberId;
            }

            $participants = [];
            foreach ($validMemberIds as $memberId) {
                $participants[] = [
                    'conversation_id' => $conversation->id,
                    'user_id' => $memberId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $this->participantRepository->insertMany($participants);

            // Tạo system message
            $actor = $this->userRepository->findOrFail($userId);
            $memberNames = collect($validMemberIds)
                ->filter(fn($id) => $id != $userId)
                ->map(fn($id) => $this->userRepository->findOrFail($id)->name)
                ->join(', ');

            $this->createSystemMessage(
                $conversation->id,
                "{$actor->name} đã tạo nhóm" . ($memberNames ? " với {$memberNames}" : '')
            );

            DB::commit();
            $conversation->load(['participants.user']);

            $allMemberIds = collect($participants)->pluck('user_id')->toArray();
            broadcast(new GroupUpdated('group_created', $conversation->id, $actor, $allMemberIds));

            return $conversation;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateGroup(int $groupId, int $userId, array $data)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if ($conversation->admin_id !== $userId) {
            throw new Exception('Chỉ quản trị viên mới có thể cập nhật nhóm.');
        }

        $updateData = [];
        $eventType = null;
        $newName = null;

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
            $eventType = 'group_renamed';
            $newName = $data['name'];
        }

        if (isset($data['avatar'])) {
            if ($conversation->avatar) {
                Storage::disk('public')->delete($conversation->avatar);
            }
            $updateData['avatar'] = $data['avatar']->store('avatars', 'public');
            $eventType = $eventType ?? 'group_avatar_changed';
        }

        $result = $this->conversationRepository->update($groupId, $updateData)->load(['participants.user', 'lastMessage.sender']);

        if ($eventType) {
            $actor = $this->userRepository->findOrFail($userId);
            $memberIds = $result->participants->pluck('user_id')->toArray();

            // Tạo system message cho update
            if ($eventType === 'group_renamed') {
                $this->createSystemMessage($groupId, "{$actor->name} đã đổi tên nhóm thành \"{$newName}\"");
            } elseif ($eventType === 'group_avatar_changed') {
                $this->createSystemMessage($groupId, "{$actor->name} đã đổi ảnh đại diện nhóm");
            }

            broadcast(new GroupUpdated($eventType, $groupId, $actor, $memberIds, null, $newName));
        }

        return $result;
    }

    /**
     * Bất cứ ai trong nhóm cũng có thể thêm thành viên mới.
     * Thành viên mới chỉ thấy tin nhắn từ lúc tham gia.
     */
    public function addGroupMember(int $groupId, int $userId, int $userIdToAdd)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if (!$conversation->is_group) {
            throw new Exception('Không thể thêm thành viên vào cuộc trò chuyện cá nhân.');
        }

        // Kiểm tra người thêm là thành viên của nhóm (bất kỳ ai cũng có thể thêm)
        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant) {
            throw new Exception('Bạn không thuộc cuộc trò chuyện này.');
        }

        $isFriend = $this->friendshipRepository->checkIsFriend($userId, $userIdToAdd);
        if (!$isFriend) {
            throw new Exception('Bạn chỉ có thể thêm bạn bè vào nhóm.');
        }

        $existingParticipant = $this->participantRepository->getParticipant($groupId, $userIdToAdd);

        if ($existingParticipant) {
            throw new Exception('Người này đã là thành viên của nhóm.');
        }

        // Sửa lỗi BUG-12: Set cleared_at = now() để thành viên mới chỉ thấy tin nhắn từ lúc tham gia
        $newParticipant = $this->participantRepository->createConversationParticipant($groupId, $userIdToAdd, 'active');
        $newParticipant->update(['cleared_at' => now()]);

        $actor = $this->userRepository->findOrFail($userId);
        $target = $this->userRepository->findOrFail($userIdToAdd);

        // Sửa lỗi BUG-06: Tạo tin nhắn hệ thống
        $this->createSystemMessage($groupId, "{$actor->name} đã thêm {$target->name} vào nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_added', $groupId, $actor, $memberIds, $target));
    }

    public function removeGroupMember(int $groupId, int $adminId, int $userIdToRemove)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if ($conversation->admin_id !== $adminId) {
            throw new Exception('Chỉ quản trị viên mới có thể xóa thành viên.');
        }

        if ($adminId === $userIdToRemove) {
            throw new Exception('Không thể xóa chính quản trị viên.');
        }

        $actor = $this->userRepository->findOrFail($adminId);
        $target = $this->userRepository->findOrFail($userIdToRemove);

        // Sửa lỗi BUG-06: Tạo tin nhắn hệ thống TRƯỚC khi xóa thành viên
        $this->createSystemMessage($groupId, "{$actor->name} đã xóa {$target->name} khỏi nhóm");

        // Sửa lỗi BUG-02: Phát sự kiện TRƯỚC khi xóa thành viên
        // Lấy danh sách member IDs khi người bị xóa vẫn còn là thành viên (để họ nhận được event)
        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_removed', $groupId, $actor, $memberIds, $target));

        $this->participantRepository->deleteByConversationAndUser($groupId, $userIdToRemove);
    }

    public function leaveGroup(int $groupId, int $userId)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if ($conversation->admin_id === $userId) {
            throw new Exception('Quản trị viên không thể rời nhóm. Hãy giải tán nhóm.');
        }

        $actor = $this->userRepository->findOrFail($userId);

        // Sửa lỗi BUG-06: Tạo tin nhắn hệ thống TRƯỚC khi rời nhóm
        $this->createSystemMessage($groupId, "{$actor->name} đã rời khỏi nhóm");

        // Sửa lỗi BUG-02: Phát sự kiện TRƯỚC khi xóa thành viên
        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_left', $groupId, $actor, $memberIds));

        $this->participantRepository->deleteByConversationAndUser($groupId, $userId);
    }

    public function dissolveGroup(int $groupId, int $adminId)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if ($conversation->admin_id !== $adminId) {
            throw new Exception('Chỉ quản trị viên mới có thể giải tán nhóm.');
        }

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        $actor = $this->userRepository->findOrFail($adminId);

        // Sửa lỗi BUG-01: Phát sự kiện TRƯỚC khi xóa cuộc trò chuyện
        // Sau khi xóa, CASCADE sẽ xóa participants & messages => xác thực kênh sẽ thất bại
        broadcast(new GroupUpdated('group_dissolved', $groupId, $actor, $memberIds));

        if ($conversation->avatar) {
            Storage::disk('public')->delete($conversation->avatar);
        }

        $this->conversationRepository->delete($groupId);
    }

    /**
     * Helper: Tạo system message cho các hành động nhóm.
     * System messages có sender_id = null và type = 'system'.
     */
    private function createSystemMessage(int $conversationId, string $content): void
    {
        $message = $this->messageRepository->create([
            'conversation_id' => $conversationId,
            'sender_id' => null,
            'content' => $content,
            'type' => 'system',
        ]);

        // Phát tin nhắn hệ thống để tất cả thành viên nhìn thấy theo thời gian thực
        $participantIds = $this->participantRepository->getParticipantIds($conversationId);
        broadcast(new MessageSent($message->load('sender'), $participantIds));
    }
}
