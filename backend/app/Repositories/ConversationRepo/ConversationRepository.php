<?php

namespace App\Repositories\ConversationRepo;

use App\Models\Conversation;
use App\Repositories\BaseRepo\BaseRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ConversationRepository extends BaseRepository implements ConversationRepositoryInterface
{
    public function getModel()
    {
        return Conversation::class;
    }

    /**
     * Lấy danh sách tất cả cuộc trò chuyện của một người dùng với các tối ưu hóa:
     * - Lọc bỏ các cuộc trò chuyện đã bị xóa (cleared) trực tiếp bằng truy vấn SQL (Tránh lỗi N+1).
     * - Tính toán sẵn số lượng tin nhắn chưa đọc thành một trường ảo (Loại bỏ vấn đề N+1 khi gọi API Resource).
     * - Sắp xếp theo tin nhắn mới nhất trực tiếp ở cấp độ cơ sở dữ liệu.
     */
    public function getUserConversations(int $userId)
    {
        return $this->model
            ->whereHas('participants', function (Builder $query) use ($userId) {
                $query->where('user_id', $userId);
            })
            // ── Logic lọc cho tin nhắn từ người lạ & Cuộc trò chuyện đã xóa (Cleared Chats) ──
            ->where(function (Builder $query) use ($userId) {
                // Điều kiện 1: Giữ lại các cuộc trò chuyện có tin nhắn được gửi SAU thời điểm cleared_at (thời điểm người dùng xóa lịch sử chat)
                $query->whereHas('messages', function (Builder $q) use ($userId) {
                    $q->whereRaw('messages.created_at >= COALESCE(
                        (SELECT cp.cleared_at 
                         FROM conversation_participants cp 
                         WHERE cp.conversation_id = messages.conversation_id 
                         AND cp.user_id = ? 
                         LIMIT 1),
                        "1970-01-01"
                    )', [$userId]);
                })
                // Điều kiện 2: Giữ lại các cuộc trò chuyện trống hoặc đã xóa NẾU trạng thái người dùng tham gia là 'active' 
                // (Dùng để xử lý các cuộc trò chuyện bình thường đã bị xóa lịch sử và các cuộc trò chuyện mới khởi tạo với người lạ chưa có tin nhắn)
                ->orWhereHas('participants', function (Builder $q) use ($userId) {
                    $q->where('user_id', $userId)
                      ->where('status', 'active');
                });
            })
            ->with(['participants.user', 'lastMessage.sender', 'streak'])
            // Tính toán sẵn (Pre-compute) số lượng tin nhắn chưa đọc thành một cột ảo (preloaded_unread_count) để tối ưu hiệu suất
            ->addSelect(['*'])
            ->selectSub(function ($query) use ($userId) {
                $query->from('messages')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('messages.sender_id', '!=', $userId)
                    ->where(function ($q) use ($userId) {
                        // Phân biệt logic kiểm tra tin nhắn chưa đọc giữa Group Chat (nhóm) và Direct Chat (1-1)
                        $q->where(function ($qDirect) {
                            // Đối với chat 1-1: Chỉ cần kiểm tra cột read_at của tin nhắn
                            $qDirect->whereRaw('conversations.is_group = false')
                                    ->whereNull('messages.read_at');
                        })
                        ->orWhere(function ($qGroup) use ($userId) {
                            // Đối với chat nhóm: Cần kiểm tra xem có tồn tại bản ghi trong bảng message_reads cho user hiện tại chưa
                            $qGroup->whereRaw('conversations.is_group = true')
                                   ->whereNotExists(function ($qRead) use ($userId) {
                                       $qRead->select(DB::raw(1))
                                             ->from('message_reads')
                                             ->whereColumn('message_reads.message_id', 'messages.id')
                                             ->where('message_reads.user_id', $userId);
                                   });
                        });
                    })
                    ->where(function ($q) use ($userId) {
                        // Chỉ đếm các tin nhắn đến sau thời điểm người dùng xóa lịch sử trò chuyện (cleared_at)
                        $q->whereRaw('messages.created_at >= COALESCE(
                            (SELECT cp2.cleared_at FROM conversation_participants cp2 
                             WHERE cp2.conversation_id = conversations.id 
                             AND cp2.user_id = ? LIMIT 1),
                            "1970-01-01"
                        )', [$userId]);
                    });
            }, 'preloaded_unread_count')
            // ── Sắp xếp các cuộc trò chuyện dựa trên thời gian tin nhắn mới nhất trực tiếp bằng truy vấn SQL ──
            ->orderByDesc(
                DB::raw('(SELECT MAX(m.created_at) FROM messages m WHERE m.conversation_id = conversations.id)')
            )
            ->orderByDesc('conversations.created_at')
            ->get();
    }

    public function getDirectConversation(int $userId, int $friendId)
    {
        return $this->model->where('is_group', false)
            ->whereHas('participants', function (Builder $query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->whereHas('participants', function (Builder $query) use ($friendId) {
                $query->where('user_id', $friendId);
            })
            ->with(['participants.user', 'lastMessage.sender', 'streak'])
            ->first();
    }

    /**
     * Lấy danh sách nhóm cộng đồng (join_type = open/request) cho trang Khám phá.
     * Chỉ hiển thị nhóm group, không hiển thị chat 1-1.
     * Sắp xếp theo số thành viên giảm dần (nhóm đông hiển thị trước).
     */
    public function getCommunities(?string $search, ?string $category, int $perPage = 12, ?int $userId = null)
    {
        $query = $this->model
            ->where('is_group', true)
            ->whereIn('join_type', ['open', 'request']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Lọc theo danh mục cộng đồng (môn học, chuyên ngành, đồ án, NCKH, CLB...)
        if ($category && $category !== 'all') {
            if ($category === 'other') {
                $query->where(function ($q) {
                    $q->where('category', 'other')
                      ->orWhereNull('category');
                });
            } else {
                $query->where('category', $category);
            }
        }

        if ($userId) {
            $query->with([
                'participants' => function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                },
                'joinRequests' => function ($q) use ($userId) {
                    $q->where('user_id', $userId)->where('status', 'pending');
                }
            ]);
        }

        return $query
            ->orderByDesc('member_count')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
