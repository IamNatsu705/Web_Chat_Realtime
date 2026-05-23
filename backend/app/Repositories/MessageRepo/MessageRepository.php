<?php

namespace App\Repositories\MessageRepo;

use App\Models\Message;
use App\Models\MessageReadReceipt;
use App\Repositories\BaseRepo\BaseRepository;

class MessageRepository extends BaseRepository implements MessageRepositoryInterface
{
    public function getModel()
    {
        return Message::class;
    }

    public function getMessagesByConversationId(int $conversationId, int $userId, int $limit, ?string $cursor)
    {
        $participant = \App\Models\ConversationParticipant::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->first();

        $clearedAt = $participant ? $participant->cleared_at : null;

        $query = $this->model->where('conversation_id', $conversationId)
            ->where(function($q) use ($userId) {
                // Kiểm tra tin nhắn chưa bị xóa bởi user này (kiểm tra mảng JSON trong MySQL)
                $q->whereNull('deleted_by')
                  ->orWhereRaw("JSON_CONTAINS(deleted_by, ?) = 0", [(string)$userId]);
            });

        if ($clearedAt) {
            $query->where('created_at', '>=', $clearedAt);
        }

        $query->with(['sender'])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc');

        return $query->cursorPaginate($limit, ['*'], 'cursor', $cursor);
    }

    /**
     * Đánh dấu tin nhắn đã đọc cho cuộc trò chuyện 1-1.
     * Cập nhật trực tiếp cột read_at trên bảng messages.
     */
    public function markMessagesAsRead(int $conversationId, int $userId)
    {
        $this->model->where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Đánh dấu tin nhắn đã đọc cho cuộc trò chuyện nhóm.
     * Thêm bản ghi vào bảng message_reads (đọc riêng từng người).
     */
    public function markGroupMessagesAsRead(int $conversationId, int $userId)
    {
        $unreadMessageIds = $this->model
            ->where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->whereDoesntHave('readReceipts', function($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->pluck('id');

        if ($unreadMessageIds->isNotEmpty()) {
            $reads = $unreadMessageIds->map(fn($id) => [
                'message_id' => $id,
                'user_id' => $userId,
                'read_at' => now(),
            ])->toArray();

            MessageReadReceipt::insert($reads);

            // Cập nhật luôn read_at trên bản ghi message (người đọc đầu tiên thắng).
            // Đảm bảo MessageResource trả về status='read' khi tải lại trang,
            // đúng quy tắc nghiệp vụ: "1 người đọc => hiển thị đã đọc".
            $this->model
                ->whereIn('id', $unreadMessageIds)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }
    }

    public function countAll(): int
    {
        return $this->model->count();
    }

    /**
     * Thống kê số tin nhắn theo ngày trong N ngày gần nhất.
     */
    public function getDailyCount(int $days = 7): array
    {
        $results = $this->model
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $data[$date] = $results[$date] ?? 0;
        }

        return $data;
    }
}

