<?php

namespace App\Services\Chat;

interface ChatServiceInterface
{
    public function getUserConversations(int $userId);

    public function getOrCreateDirectConversation(int $userId, int $friendId);

    public function getMessages(int $conversationId, int $userId, int $limit, ?string $cursor);

    public function sendMessage(int $conversationId, int $userId, array $data);

    public function markAsRead(int $conversationId, int $userId);

    // Message management
    public function recallMessage(int $messageId, int $userId);

    public function deleteMessageForMe(int $messageId, int $userId);

    public function clearConversation(int $conversationId, int $userId);

    // Stranger conversation
    public function acceptStrangerConversation(int $conversationId, int $userId);

    public function rejectStrangerConversation(int $conversationId, int $userId);
}
