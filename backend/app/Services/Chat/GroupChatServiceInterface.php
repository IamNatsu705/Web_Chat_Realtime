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
}
