<?php

namespace App\Repositories\ConversationParticipantRepo;

use App\Models\ConversationParticipant;
use App\Repositories\BaseRepo\BaseRepository;

/**
 * Repository Thành viên cuộc trò chuyện (Conversation Participant Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng conversation_participants.
 */
class ConversationParticipantRepository extends BaseRepository implements ConversationParticipantRepositoryInterface
{
    public function getModel(): string
    {
        return ConversationParticipant::class;
    }

    /** {@inheritdoc} */
    public function createConversationParticipant(int $conversationId, int $userId, string $status)
    {
        // Dùng firstOrCreate để tránh lỗi Unique Constraint Violation khi spam click tham gia
        return $this->model->firstOrCreate(
            ['conversation_id' => $conversationId, 'user_id' => $userId],
            ['status' => $status]
        );
    }

    /** {@inheritdoc} */
    public function getOtherParticipant(int $conversationId, int $userId)
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', '!=', $userId)
            ->first();
    }

    /** {@inheritdoc} */
    public function getParticipantIds(int $conversationId): array
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->pluck('user_id')
            ->toArray();
    }

    /** {@inheritdoc} */
    public function getParticipant(int $conversationId, int $userId): ?ConversationParticipant
    {
        return $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->first();
    }

    /** {@inheritdoc} */
    public function deleteByConversationAndUser(int $conversationId, int $userId): bool
    {
        return (bool) $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete();
    }

    /** {@inheritdoc} */
    public function updateClearedAt(int $conversationId, int $userId): void
    {
        $this->model
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['cleared_at' => now()]);
    }

    /** {@inheritdoc} */
    public function insertMany(array $participants): void
    {
        ConversationParticipant::insert($participants);
    }

    /** {@inheritdoc} */
    public function activateParticipants(int $conversationId, array $userIds): void
    {
        $this->model
            ->where('conversation_id', $conversationId)
            ->whereIn('user_id', $userIds)
            ->where('status', '!=', 'active')
            ->update(['status' => 'active']);
    }
}
