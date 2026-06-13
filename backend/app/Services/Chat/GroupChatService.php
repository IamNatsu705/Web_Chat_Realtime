<?php

namespace App\Services\Chat;

use App\Events\Chat\GroupUpdated;
use App\Events\Chat\MessageSent;
use App\Repositories\ConversationRepo\ConversationRepositoryInterface;
use App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface;
use App\Repositories\FriendshipRepo\FriendshipRepositoryInterface;
use App\Repositories\GroupJoinRequestRepo\GroupJoinRequestRepositoryInterface;
use App\Repositories\MessageRepo\MessageRepositoryInterface;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Exception;

class GroupChatService implements GroupChatServiceInterface
{
    public function __construct(
        protected ConversationRepositoryInterface $conversationRepository,
        protected ConversationParticipantRepositoryInterface $participantRepository,
        protected FriendshipRepositoryInterface $friendshipRepository,
        protected UserRepositoryInterface $userRepository,
        protected MessageRepositoryInterface $messageRepository,
        protected GroupJoinRequestRepositoryInterface $joinRequestRepository,
    ) {}

    // =====================================================================
    //  TẠO NHÓM — Mở rộng hỗ trợ join_type + description
    // =====================================================================

    public function createGroup(int $userId, array $data)
    {
        DB::beginTransaction();
        try {
            $joinType = $data['join_type'] ?? 'invite';

            $conversationData = [
                'name'         => $data['name'],
                'description'  => $data['description'] ?? null,
                'is_group'     => true,
                'join_type'    => $joinType,
                'category'     => $data['category'] ?? null,
                'admin_id'     => $userId,
                'member_count' => 0, // Sẽ cập nhật sau khi thêm participants
            ];

            if (isset($data['avatar'])) {
                $conversationData['avatar'] = $data['avatar']->store('avatars', 'public');
            }

            $conversation = $this->conversationRepository->create($conversationData);

            // Với nhóm invite (private): validate thành viên phải là bạn bè
            // Với nhóm open/request (community): cho phép tạo nhóm chỉ có creator
            $validMemberIds = [$userId];

            if (isset($data['member_ids'])) {
                foreach ($data['member_ids'] as $memberId) {
                    if ($memberId == $userId) continue;

                    // Nhóm private: chỉ cho phép thêm bạn bè
                    if ($joinType === 'invite') {
                        $isFriend = $this->friendshipRepository->checkIsFriend($userId, $memberId);
                        if (!$isFriend) {
                            throw new Exception("Bạn chỉ có thể thêm bạn bè vào nhóm riêng tư. User ID $memberId không phải bạn bè.");
                        }
                    }
                    $validMemberIds[] = $memberId;
                }
            }

            $participants = [];
            foreach ($validMemberIds as $index => $memberId) {
                $participants[] = [
                    'conversation_id' => $conversation->id,
                    'user_id'         => $memberId,
                    'status'          => 'active',
                    // Người tạo nhóm là owner, còn lại là member
                    'role'            => ($memberId === $userId) ? 'owner' : 'member',
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ];
            }

            $this->participantRepository->insertMany($participants);

            // Cập nhật member_count
            $conversation->update(['member_count' => count($validMemberIds)]);

            // Tạo system message
            /** @var User $actor */
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

    // =====================================================================
    //  CẬP NHẬT NHÓM — Thêm description
    // =====================================================================

    public function updateGroup(int $groupId, int $userId, array $data)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        // Chỉ owner mới được cập nhật nhóm
        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant || !$participant->isOwner()) {
            throw new Exception('Chỉ trưởng nhóm mới có thể cập nhật thông tin nhóm.');
        }

        $updateData = [];
        $eventType = null;
        $newName = null;

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
            $eventType = 'group_renamed';
            $newName = $data['name'];
        }

        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }

        if (isset($data['join_type'])) {
            $updateData['join_type'] = $data['join_type'];
        }

        if (array_key_exists('category', $data)) {
            $updateData['category'] = $data['category'];
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
            /** @var User $actor */
            $actor = $this->userRepository->findOrFail($userId);
            $memberIds = $result->participants->pluck('user_id')->toArray();

            if ($eventType === 'group_renamed') {
                $this->createSystemMessage($groupId, "{$actor->name} đã đổi tên nhóm thành \"{$newName}\"");
            } elseif ($eventType === 'group_avatar_changed') {
                $this->createSystemMessage($groupId, "{$actor->name} đã đổi ảnh đại diện nhóm");
            }

            broadcast(new GroupUpdated($eventType, $groupId, $actor, $memberIds, null, $newName));
        }

        return $result;
    }

    // =====================================================================
    //  THÊM THÀNH VIÊN — Bất cứ ai trong nhóm cũng thêm được
    // =====================================================================

    /**
     * Bất cứ ai trong nhóm cũng có thể thêm thành viên mới.
     * Với nhóm invite: chỉ thêm được bạn bè.
     * Với nhóm open/request: owner/mod có thể thêm trực tiếp bất kỳ ai.
     * Thành viên mới chỉ thấy tin nhắn từ lúc tham gia.
     */
    public function addGroupMember(int $groupId, int $userId, int $userIdToAdd)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if (!$conversation->is_group) {
            throw new Exception('Không thể thêm thành viên vào cuộc trò chuyện cá nhân.');
        }

        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant) {
            throw new Exception('Bạn không thuộc cuộc trò chuyện này.');
        }

        // Nhóm invite: chỉ thêm được bạn bè
        if ($conversation->join_type === 'invite') {
            $isFriend = $this->friendshipRepository->checkIsFriend($userId, $userIdToAdd);
            if (!$isFriend) {
                throw new Exception('Bạn chỉ có thể thêm bạn bè vào nhóm riêng tư.');
            }
        }

        $existingParticipant = $this->participantRepository->getParticipant($groupId, $userIdToAdd);
        if ($existingParticipant) {
            throw new Exception('Người này đã là thành viên của nhóm.');
        }

        // Đặt cleared_at = null để thành viên mới có thể thấy tin nhắn cũ trước đây
        $newParticipant = $this->participantRepository->createConversationParticipant($groupId, $userIdToAdd, 'active');
        $newParticipant->update(['role' => 'member', 'cleared_at' => null]);

        // Cập nhật member_count
        $conversation->increment('member_count');

        // Xóa join request nếu có (trường hợp owner/mod thêm trực tiếp người đã gửi request)
        $this->joinRequestRepository->deleteByConversationAndUser($groupId, $userIdToAdd);

        /** @var User $actor */
        $actor = $this->userRepository->findOrFail($userId);
        /** @var User $target */
        $target = $this->userRepository->findOrFail($userIdToAdd);

        $this->createSystemMessage($groupId, "{$actor->name} đã thêm {$target->name} vào nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_added', $groupId, $actor, $memberIds, $target));
    }

    // =====================================================================
    //  XÓA THÀNH VIÊN — Owner hoặc Mod đều kick được
    // =====================================================================

    public function removeGroupMember(int $groupId, int $adminId, int $userIdToRemove)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        // Kiểm tra quyền: owner hoặc moderator mới kick được
        $adminParticipant = $this->participantRepository->getParticipant($groupId, $adminId);
        if (!$adminParticipant || !$adminParticipant->isOwnerOrMod()) {
            throw new Exception('Chỉ trưởng/phó nhóm mới có thể xóa thành viên.');
        }

        // Không được tự kick chính mình
        if ($adminId === $userIdToRemove) {
            throw new Exception('Không thể xóa chính mình. Hãy dùng chức năng rời nhóm.');
        }

        // Moderator không được kick owner hoặc moderator khác
        $targetParticipant = $this->participantRepository->getParticipant($groupId, $userIdToRemove);
        if ($adminParticipant->isModerator() && $targetParticipant && $targetParticipant->isOwnerOrMod()) {
            throw new Exception('Phó nhóm không thể xóa trưởng nhóm hoặc phó nhóm khác.');
        }

        /** @var User $actor */
        $actor = $this->userRepository->findOrFail($adminId);
        /** @var User $target */
        $target = $this->userRepository->findOrFail($userIdToRemove);

        $this->createSystemMessage($groupId, "{$actor->name} đã xóa {$target->name} khỏi nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_removed', $groupId, $actor, $memberIds, $target));

        $this->participantRepository->deleteByConversationAndUser($groupId, $userIdToRemove);

        // Cập nhật member_count
        $conversation->decrement('member_count');
    }

    // =====================================================================
    //  RỜI NHÓM
    // =====================================================================

    public function leaveGroup(int $groupId, int $userId)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant) {
            throw new Exception('Bạn không phải thành viên của nhóm này.');
        }

        if ($participant->isOwner()) {
            throw new Exception('Trưởng nhóm không thể rời nhóm. Hãy giải tán nhóm.');
        }

        /** @var User $actor */
        $actor = $this->userRepository->findOrFail($userId);

        $this->createSystemMessage($groupId, "{$actor->name} đã rời khỏi nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_left', $groupId, $actor, $memberIds));

        $this->participantRepository->deleteByConversationAndUser($groupId, $userId);

        // Cập nhật member_count
        $conversation->decrement('member_count');
    }

    // =====================================================================
    //  GIẢI TÁN NHÓM
    // =====================================================================

    public function dissolveGroup(int $groupId, int $adminId)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        $participant = $this->participantRepository->getParticipant($groupId, $adminId);
        if (!$participant || !$participant->isOwner()) {
            throw new Exception('Chỉ trưởng nhóm mới có thể giải tán nhóm.');
        }

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        /** @var User $actor */
        $actor = $this->userRepository->findOrFail($adminId);

        broadcast(new GroupUpdated('group_dissolved', $groupId, $actor, $memberIds));

        if ($conversation->avatar) {
            Storage::disk('public')->delete($conversation->avatar);
        }

        $this->conversationRepository->delete($groupId);
    }

    // =====================================================================
    //  COMMUNITY: KHÁM PHÁ NHÓM
    // =====================================================================

    /**
     * Lấy danh sách nhóm cộng đồng (open/request) cho trang Khám phá.
     */
    public function getCommunities(?string $search, ?string $category, int $perPage = 12, ?int $userId = null)
    {
        return $this->conversationRepository->getCommunities($search, $category, $perPage, $userId);
    }

    // =====================================================================
    //  COMMUNITY: THAM GIA NHÓM (Unified)
    // =====================================================================

    /**
     * BUG-F FIX: Unified joinGroup — tự động phân biệt open/request dựa trên join_type.
     * Controller chỉ cần gọi 1 method duy nhất, không cần resolve repository bằng app().
     * Chỉ cần 1 lần findOrFail thay vì 2.
     *
     * @return array{type: string, data: mixed} Trả về loại hành động (joined/requested) và dữ liệu.
     */
    public function joinGroup(int $groupId, int $userId): array
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if ($conversation->join_type === 'open') {
            $this->performJoinOpenGroup($conversation, $userId);
            return ['type' => 'joined', 'data' => null];
        }

        if ($conversation->join_type === 'request') {
            $joinRequest = $this->requestToJoin($groupId, $userId);
            return ['type' => 'requested', 'data' => $joinRequest];
        }

        throw new Exception('Nhóm này chỉ cho phép tham gia qua lời mời.');
    }

    // =====================================================================
    //  COMMUNITY: THAM GIA NHÓM OPEN
    // =====================================================================

    /**
     * User tham gia nhóm open — vào ngay lập tức.
     * Tạo system message thông báo và phát sự kiện WebSocket.
     */
    public function joinOpenGroup(int $groupId, int $userId)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);
        $this->performJoinOpenGroup($conversation, $userId);
    }

    /**
     * Thực hiện join nhóm open với conversation đã load sẵn (tránh double query).
     */
    private function performJoinOpenGroup($conversation, int $userId): void
    {
        $groupId = $conversation->id;

        if ($conversation->join_type !== 'open') {
            throw new Exception('Nhóm này không cho phép tham gia tự do.');
        }

        // Kiểm tra đã là thành viên chưa
        $existing = $this->participantRepository->getParticipant($groupId, $userId);
        if ($existing) {
            throw new Exception('Bạn đã là thành viên của nhóm này.');
        }

        $newParticipant = $this->participantRepository->createConversationParticipant($groupId, $userId, 'active');
        $newParticipant->update(['role' => 'member', 'cleared_at' => null]);

        $conversation->increment('member_count');

        /** @var User $actor */
        $actor = $this->userRepository->findOrFail($userId);
        $this->createSystemMessage($groupId, "{$actor->name} đã tham gia nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_added', $groupId, $actor, $memberIds));
    }

    // =====================================================================
    //  COMMUNITY: GỬI YÊU CẦU THAM GIA
    // =====================================================================

    /**
     * User gửi yêu cầu tham gia nhóm request.
     * Yêu cầu sẽ chờ trưởng/phó nhóm duyệt.
     */
    public function requestToJoin(int $groupId, int $userId)
    {
        $conversation = $this->conversationRepository->findOrFail($groupId);

        if ($conversation->join_type !== 'request') {
            throw new Exception('Nhóm này không yêu cầu phê duyệt để tham gia.');
        }

        // Kiểm tra đã là thành viên chưa
        $existing = $this->participantRepository->getParticipant($groupId, $userId);
        if ($existing) {
            throw new Exception('Bạn đã là thành viên của nhóm này.');
        }

        // Kiểm tra đã có yêu cầu pending chưa
        $pendingRequest = $this->joinRequestRepository->findPendingByUser($groupId, $userId);
        if ($pendingRequest) {
            throw new Exception('Bạn đã gửi yêu cầu tham gia rồi. Vui lòng đợi duyệt.');
        }

        // Xóa bản ghi cũ (rejected hoặc approved) để cho phép gửi yêu cầu lại
        // Unique constraint (conversation_id, user_id) chặn insert nếu bản ghi cũ còn tồn tại
        \App\Models\GroupJoinRequest::where('conversation_id', $groupId)
            ->where('user_id', $userId)
            ->delete();

        // Dùng firstOrCreate để tránh lỗi Unique Constraint Violation khi spam click
        return $this->joinRequestRepository->firstOrCreate(
            ['conversation_id' => $groupId, 'user_id' => $userId],
            ['status' => 'pending']
        );
    }

    /**
     * User hủy yêu cầu tham gia nhóm đang chờ duyệt.
     */
    public function cancelJoinRequest(int $groupId, int $userId)
    {
        $pendingRequest = $this->joinRequestRepository->findPendingByUser($groupId, $userId);
        if (!$pendingRequest) {
            throw new Exception('Bạn không có yêu cầu tham gia nào đang chờ duyệt.');
        }

        $pendingRequest->delete();
    }

    // =====================================================================
    //  COMMUNITY: DUYỆT/TỪ CHỐI YÊU CẦU
    // =====================================================================

    /**
     * Trưởng/Phó nhóm duyệt (approve) hoặc từ chối (reject) yêu cầu tham gia.
     * Khi approve: thêm user vào nhóm + tạo system message.
     * Khi reject: xóa yêu cầu.
     */
    public function respondToJoinRequest(int $requestId, int $reviewerId, string $action)
    {
        $joinRequest = $this->joinRequestRepository->findOrFail($requestId);
        $groupId = $joinRequest->conversation_id;

        // Kiểm tra quyền: phải là owner hoặc moderator
        $reviewerParticipant = $this->participantRepository->getParticipant($groupId, $reviewerId);
        if (!$reviewerParticipant || !$reviewerParticipant->isOwnerOrMod()) {
            throw new Exception('Chỉ trưởng/phó nhóm mới có thể duyệt yêu cầu.');
        }

        if ($joinRequest->status !== 'pending') {
            throw new Exception('Yêu cầu này đã được xử lý.');
        }

        if ($action === 'approve') {
            // Thêm user vào nhóm
            $newParticipant = $this->participantRepository->createConversationParticipant(
                $groupId,
                $joinRequest->user_id,
                'active'
            );
            $newParticipant->update(['role' => 'member', 'cleared_at' => null]);

            // Cập nhật member_count
            $conversation = $this->conversationRepository->findOrFail($groupId);
            $conversation->increment('member_count');

            // Cập nhật request
            $joinRequest->update([
                'status'      => 'approved',
                'reviewed_by' => $reviewerId,
            ]);

            // System message
            /** @var User $user */
            $user = $this->userRepository->findOrFail($joinRequest->user_id);
            $this->createSystemMessage($groupId, "{$user->name} đã tham gia nhóm");

            /** @var User $reviewer */
            $reviewer = $this->userRepository->findOrFail($reviewerId);
            $memberIds = $this->participantRepository->getParticipantIds($groupId);
            broadcast(new GroupUpdated('member_added', $groupId, $reviewer, $memberIds, $user));

        } elseif ($action === 'reject') {
            $joinRequest->update([
                'status'      => 'rejected',
                'reviewed_by' => $reviewerId,
            ]);
        } else {
            throw new Exception('Hành động không hợp lệ. Chỉ chấp nhận approve hoặc reject.');
        }
    }

    // =====================================================================
    //  COMMUNITY: DANH SÁCH YÊU CẦU CHỜ DUYỆT
    // =====================================================================

    /**
     * Lấy danh sách yêu cầu đang chờ duyệt.
     * Chỉ owner/moderator mới xem được.
     */
    public function getPendingJoinRequests(int $groupId, int $userId)
    {
        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant || !$participant->isOwnerOrMod()) {
            throw new Exception('Chỉ trưởng/phó nhóm mới có thể xem yêu cầu tham gia.');
        }

        return $this->joinRequestRepository->getPendingRequests($groupId);
    }

    // =====================================================================
    //  COMMUNITY: THĂNG/HẠ CẤP MODERATOR
    // =====================================================================

    /**
     * Trưởng nhóm thăng cấp thành viên lên phó nhóm.
     */
    public function promoteModerator(int $groupId, int $ownerId, int $userId)
    {
        $ownerParticipant = $this->participantRepository->getParticipant($groupId, $ownerId);
        if (!$ownerParticipant || !$ownerParticipant->isOwner()) {
            throw new Exception('Chỉ trưởng nhóm mới có thể thêm phó nhóm.');
        }

        $targetParticipant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$targetParticipant) {
            throw new Exception('Người dùng không phải thành viên của nhóm.');
        }

        if ($targetParticipant->isOwnerOrMod()) {
            throw new Exception('Người dùng đã là trưởng hoặc phó nhóm.');
        }

        $targetParticipant->update(['role' => 'moderator']);

        /** @var User $owner */
        $owner = $this->userRepository->findOrFail($ownerId);
        /** @var User $target */
        $target = $this->userRepository->findOrFail($userId);
        $this->createSystemMessage($groupId, "{$owner->name} đã thêm {$target->name} làm phó nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_promoted', $groupId, $owner, $memberIds, $target));
    }

    /**
     * Trưởng nhóm hạ cấp phó nhóm thành thành viên.
     */
    public function demoteModerator(int $groupId, int $ownerId, int $userId)
    {
        $ownerParticipant = $this->participantRepository->getParticipant($groupId, $ownerId);
        if (!$ownerParticipant || !$ownerParticipant->isOwner()) {
            throw new Exception('Chỉ trưởng nhóm mới có thể gỡ phó nhóm.');
        }

        $targetParticipant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$targetParticipant || !$targetParticipant->isModerator()) {
            throw new Exception('Người dùng không phải phó nhóm.');
        }

        $targetParticipant->update(['role' => 'member']);

        /** @var User $owner */
        $owner = $this->userRepository->findOrFail($ownerId);
        /** @var User $target */
        $target = $this->userRepository->findOrFail($userId);
        $this->createSystemMessage($groupId, "{$owner->name} đã gỡ {$target->name} khỏi vị trí phó nhóm");

        $memberIds = $this->participantRepository->getParticipantIds($groupId);
        broadcast(new GroupUpdated('member_demoted', $groupId, $owner, $memberIds, $target));
    }

    // =====================================================================
    //  HELPER: TẠO SYSTEM MESSAGE
    // =====================================================================

    /**
     * Tạo system message cho các hành động nhóm.
     * System messages có sender_id = null và type = 'system'.
     */
    private function createSystemMessage(int $conversationId, string $content): void
    {
        $message = $this->messageRepository->create([
            'conversation_id' => $conversationId,
            'sender_id'       => null,
            'content'         => $content,
            'type'            => 'system',
        ]);

        $participantIds = $this->participantRepository->getParticipantIds($conversationId);
        broadcast(new MessageSent($message->load('sender'), $participantIds));
    }
}
