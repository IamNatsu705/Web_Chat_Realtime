<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Cuộc trò chuyện (Conversation Resource).
 *
 * Biến đổi model Conversation thành JSON cho API response.
 * Xử lý nhiều trường tính toán phức tạp:
 * - Danh sách thành viên (lọc tài khoản đã xóa).
 * - Trạng thái tham gia (my_status), vai trò (my_role).
 * - Tin nhắn cuối cùng (ẩn nếu đã xóa lịch sử).
 * - Số tin nhắn chưa đọc (pre-computed, tránh N+1).
 * - Thông tin Streak (chỉ hiển thị khi >= 3 ngày).
 */
class ConversationResource extends JsonResource
{
    /**
     * Biến đổi cuộc trò chuyện thành mảng dữ liệu.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'avatar' => $this->avatar,
            'is_group' => $this->is_group,
            'admin_id' => $this->admin_id,
            'join_type' => $this->join_type,
            'category' => $this->category,
            'member_count' => $this->member_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Trạng thái yêu cầu tham gia của user hiện tại (cho trang Khám phá)
            'my_join_request_status' => $this->whenLoaded('joinRequests', function () use ($request) {
                return $this->joinRequests
                    ->where('user_id', $request->user()?->id)
                    ->first()?->status;
            }),
            
            // Danh sách thành viên — lọc tài khoản đã xóa để tránh FE crash
            'participants' => $this->whenLoaded('participants', function() {
                return $this->participants->map(function($participant) {
                    if (!$participant->user) return null;
                    return [
                        'id' => $participant->user->id,
                        'name' => $participant->user->name,
                        'avatar' => $participant->user->avatar,
                        'last_seen_at' => $participant->user->last_seen_at,
                        'bio' => $participant->user->bio,
                        'student_id' => $participant->user->student_id,
                        'department' => $participant->user->department,
                        // Vai trò trong nhóm (owner/moderator/member)
                        'role' => $participant->role ?? 'member',
                    ];
                })->filter()->values();
            }),

            // Trạng thái tham gia của user hiện tại (active/pending/rejected)
            'my_status' => $this->whenLoaded('participants', function() use ($request) {
                $participant = $this->participants->firstWhere('user_id', $request->user()?->id);
                return $participant ? $participant->status : null;
            }),

            // Vai trò của user hiện tại trong nhóm (owner/moderator/member)
            'my_role' => $this->whenLoaded('participants', function() use ($request) {
                $participant = $this->participants->firstWhere('user_id', $request->user()?->id);
                return $participant ? ($participant->role ?? 'member') : null;
            }),

            // Tin nhắn cuối cùng — ẩn nếu user đã xóa lịch sử (cleared_at)
            'last_message' => $this->whenLoaded('lastMessage', function () use ($request) {
                if (!$this->lastMessage) return null;
                $participant = $this->participants->firstWhere('user_id', $request->user()?->id);
                $clearedAt = $participant ? $participant->cleared_at : null;
                if ($clearedAt && $this->lastMessage->created_at < $clearedAt) {
                    return null;
                }
                return new MessageResource($this->lastMessage);
            }),

            // Số tin nhắn chưa đọc (pre-computed từ Repository, tránh N+1)
            'unread_count' => $this->preloaded_unread_count ?? 0,

            // Thông tin Streak cho chat 1-1 (chỉ hiển thị khi chuỗi >= 3 ngày)
            'streak' => $this->whenLoaded('streak', function () {
                if (!$this->streak || $this->streak->current_streak < 3) {
                    return null;
                }
                return [
                    'current_streak' => $this->streak->current_streak,
                    'status' => $this->streak->status,
                    'restore_days' => $this->streak->restore_days,
                    'tier' => $this->streak->getMilestoneTier(),
                    'is_milestone' => $this->streak->isMilestone(),
                    // Cả 2 user đã hoàn thành streak hôm nay chưa
                    'today_completed' => $this->streak->last_completed_date
                        && $this->streak->last_completed_date->isToday(),
                ];
            }),
        ];
    }
}
