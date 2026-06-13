<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Thành viên cuộc trò chuyện (Conversation Participant).
 *
 * Lưu trữ mối quan hệ giữa Người dùng và Cuộc trò chuyện, bao gồm:
 * - Trạng thái tham gia (active, pending, rejected).
 * - Vai trò trong nhóm (owner, moderator, member).
 * - Thời điểm xóa lịch sử (cleared_at) — tin nhắn trước thời điểm này sẽ bị ẩn.
 */
class ConversationParticipant extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'user_id', 'status', 'role', 'cleared_at'];

    protected $casts = [
        'cleared_at' => 'datetime',
    ];

    /**
     * Cuộc trò chuyện mà thành viên này thuộc về.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Thông tin người dùng của thành viên.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Kiểm tra người dùng là trưởng nhóm.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Kiểm tra người dùng là phó nhóm.
     */
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    /**
     * Kiểm tra người dùng là trưởng hoặc phó nhóm.
     */
    public function isOwnerOrMod(): bool
    {
        return in_array($this->role, ['owner', 'moderator']);
    }
}
