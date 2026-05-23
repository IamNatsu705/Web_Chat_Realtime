<?php

namespace App\Services\Chat;

interface StreakServiceInterface
{
    public function handleMessageSent(int $conversationId, int $senderId): void;

    public function restoreStreak(int $conversationId, int $userId): array;

    public function shareStreak(int $conversationId, int $userId): array;

    public function getStreakForConversation(int $conversationId, ?int $userId = null): ?array;

    public function checkAllStreaks(): void;
}
