<?php

namespace App\Repositories\ConversationParticipantRepo;

use App\Models\ConversationParticipant;
use App\Repositories\BaseRepo\BaseRepositoryInterface;

interface ConversationParticipantRepositoryInterface extends BaseRepositoryInterface
{
    public function createConversationParticipant(int $conversationId, int $userId, string $status);

    public function getOtherParticipant(int $conversationId, int $userId);

    public function getParticipantIds(int $conversationId): array;

    public function getParticipant(int $conversationId, int $userId): ?ConversationParticipant;

    public function deleteByConversationAndUser(int $conversationId, int $userId): bool;

    public function updateClearedAt(int $conversationId, int $userId): void;

    public function insertMany(array $participants): void;

    public function activateParticipants(int $conversationId, array $userIds): void;
}
