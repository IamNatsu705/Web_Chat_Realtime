<?php

namespace App\Repositories\ConversationParticipantRepo;

use App\Models\ConversationParticipant;
use App\Repositories\BaseRepo\BaseRepository;

class ConversationParticipantRepository extends BaseRepository implements ConversationParticipantRepositoryInterface
{
    public function getModel(): string
    {
        return ConversationParticipant::class;
    }

    public function createConversationParticipant(int $conversationId, int $userId, string $status)
    {
        return $this->model->create([
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'status' => $status,
        ]);
    }

    public function getOtherParticipant(int $conversationId, int $userId)
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', '!=', $userId)
            ->first();
    }

    public function getParticipantIds(int $conversationId): array
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->pluck('user_id')
            ->toArray();
    }

    public function getParticipant(int $conversationId, int $userId): ?ConversationParticipant
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->first();
    }

    public function deleteByConversationAndUser(int $conversationId, int $userId): bool
    {
        return (bool) $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete();
    }

    public function updateClearedAt(int $conversationId, int $userId): void
    {
        $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['cleared_at' => now()]);
    }

    public function insertMany(array $participants): void
    {
        ConversationParticipant::insert($participants);
    }

    public function activateParticipants(int $conversationId, array $userIds): void
    {
        $this->model
            ->where('conversation_id', $conversationId)
            ->whereIn('user_id', $userIds)
            ->where('status', '!=', 'active')
            ->update(['status' => 'active']);
    }
}
