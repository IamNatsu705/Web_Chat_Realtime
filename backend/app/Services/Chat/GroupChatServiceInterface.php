<?php

namespace App\Services\Chat;

interface GroupChatServiceInterface
{
    public function createGroup(int $userId, array $data);

    public function updateGroup(int $groupId, int $userId, array $data);

    public function addGroupMember(int $groupId, int $userId, int $userIdToAdd);

    public function removeGroupMember(int $groupId, int $adminId, int $userIdToRemove);

    public function leaveGroup(int $groupId, int $userId);

    public function dissolveGroup(int $groupId, int $adminId);

    // ── Community features ──────────────────────────────────────────────────

    /**
     * Lấy danh sách nhóm cộng đồng (trang Khám phá).
     */
    public function getCommunities(?string $search, ?string $category, int $perPage = 12, ?int $userId = null);

    /**
     * Tham gia nhóm open trực tiếp.
     */
    public function joinOpenGroup(int $groupId, int $userId);

    /**
     * Gửi yêu cầu tham gia nhóm request.
     */
    public function requestToJoin(int $groupId, int $userId);

    /**
     * Hủy yêu cầu tham gia nhóm đang chờ duyệt.
     */
    public function cancelJoinRequest(int $groupId, int $userId);

    /**
     * Trưởng/Phó nhóm duyệt hoặc từ chối yêu cầu.
     */
    public function respondToJoinRequest(int $requestId, int $reviewerId, string $action);

    /**
     * Lấy danh sách yêu cầu đang chờ duyệt.
     */
    public function getPendingJoinRequests(int $groupId, int $userId);

    /**
     * Trưởng nhóm thăng cấp thành viên lên phó nhóm.
     */
    public function promoteModerator(int $groupId, int $ownerId, int $userId);

    /**
     * Trưởng nhóm hạ cấp phó nhóm thành thành viên.
     */
    public function demoteModerator(int $groupId, int $ownerId, int $userId);
}

