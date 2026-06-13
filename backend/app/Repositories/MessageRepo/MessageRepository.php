<?php

namespace App\Repositories\MessageRepo;

use App\Models\Message;
use App\Models\MessageReadReceipt;
use App\Repositories\BaseRepo\BaseRepository;

/**
 * Repository Tin nhắn (Message Repository).
 *
 * Triển khai các truy vấn liên quan đến bảng messages và message_reads.
 * Xử lý phân trang cursor, đánh dấu đã đọc (riêng biệt cho 1-1 và nhóm), và thống kê.
 */
class MessageRepository extends BaseRepository implements MessageRepositoryInterface
{
    public function getModel()
    {
        return Message::class;
    }

    /**
     * Lấy danh sách tin nhắn theo cuộc trò chuyện (phân trang dạng cursor).
     *
     * Logic lọc:
     * - Loại bỏ tin nhắn đã bị người dùng xóa phía mình (deleted_by chứa userId).
     * - Chỉ lấy tin nhắn sau thời điểm xóa lịch sử (cleared_at) nếu có.
     * - Sắp xếp theo thời gian mới nhất trước (desc).
     */
    public function getMessagesByConversationId(int $conversationId, int $userId, int $limit, ?string $cursor)
    {
        // Lấy thời điểm xóa lịch sử của người dùng trong cuộc trò chuyện này
        $participant = \App\Models\ConversationParticipant::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->first();

        $clearedAt = $participant ? $participant->cleared_at : null;

        $query = $this->model->where('conversation_id', $conversationId)
            ->where(function($q) use ($userId) {
                // BUG-10 FIX: Sử dụng Eloquent JSON method thay vì raw SQL JSON_CONTAINS
                // whereJsonDoesntContain hoạt động trên cả MySQL và SQLite
                $q->whereNull('deleted_by')
                  ->orWhereJsonDoesntContain('deleted_by', (int)$userId);
            });

        // Chỉ lấy tin nhắn sau thời điểm xóa lịch sử
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
        // Tìm tất cả tin nhắn chưa được user này đọc
        $unreadMessageIds = $this->model
            ->where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->whereDoesntHave('readReceipts', function($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->pluck('id');

        if ($unreadMessageIds->isNotEmpty()) {
            // Tạo bản ghi đã đọc cho từng tin nhắn
            $reads = $unreadMessageIds->map(fn($id) => [
                'message_id' => $id,
                'user_id' => $userId,
                'read_at' => now(),
            ])->toArray();

            // Sửa lại thành upsert (insertOrIgnore) để tránh lỗi race condition
            MessageReadReceipt::insertOrIgnore($reads);

            // Cập nhật luôn read_at trên bản ghi message (người đọc đầu tiên thắng).
            // Đảm bảo MessageResource trả về status='read' khi tải lại trang,
            // đúng quy tắc nghiệp vụ: "1 người đọc => hiển thị đã đọc".
            $this->model
                ->whereIn('id', $unreadMessageIds)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }
    }

    /** {@inheritdoc} */
    public function countAll(): int
    {
        return $this->model->count();
    }

    /**
     * Thống kê số tin nhắn theo ngày trong N ngày gần nhất.
     * Điền giá trị 0 cho những ngày không có tin nhắn.
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

        // Điền giá trị 0 cho những ngày không có dữ liệu
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $data[$date] = $results[$date] ?? 0;
        }

        return $data;
    }
}
