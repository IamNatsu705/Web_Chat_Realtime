<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Chuỗi ngày nhắn tin liên tiếp (Streak).
 *
 * Theo dõi chuỗi ngày mà hai người dùng nhắn tin cho nhau liên tục (mỗi ngày cả hai đều gửi ít nhất 1 tin).
 * Streak tăng lên khi cả hai bên đều nhắn tin trong cùng một ngày.
 * Streak bị mất nếu một trong hai bên không nhắn tin trong ngày.
 *
 * Các mốc (milestone): 5, 10, 15, 30, 50, 100 ngày — hiển thị biểu tượng đặc biệt.
 */
class Streak extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_a_id',
        'user_b_id',
        'current_streak',
        'last_completed_date',
        'user_a_last_msg_date',
        'user_b_last_msg_date',
        'restore_days',
        'status',
    ];

    protected $casts = [
        'user_a_id' => 'integer',
        'user_b_id' => 'integer',
        'current_streak' => 'integer',
        'last_completed_date' => 'date',
        'user_a_last_msg_date' => 'date',
        'user_b_last_msg_date' => 'date',
        'restore_days' => 'integer',
    ];

    /**
     * Cuộc trò chuyện mà Streak này thuộc về.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Người dùng phía A trong cặp Streak.
     */
    public function userA()
    {
        return $this->belongsTo(User::class, 'user_a_id');
    }

    /**
     * Người dùng phía B trong cặp Streak.
     */
    public function userB()
    {
        return $this->belongsTo(User::class, 'user_b_id');
    }

    /**
     * Xác định người dùng thuộc phía nào trong cặp Streak.
     *
     * @param int $userId ID của người dùng cần kiểm tra.
     * @return string|null Trả về 'a', 'b', hoặc null nếu không thuộc Streak này.
     */
    public function getUserSide(int $userId): ?string
    {
        if ($this->user_a_id === $userId) return 'a';
        if ($this->user_b_id === $userId) return 'b';
        return null;
    }

    /**
     * Lấy ID của người dùng còn lại trong cặp Streak.
     *
     * @param int $userId ID của người dùng hiện tại.
     * @return int|null ID người dùng đối diện, hoặc null nếu không thuộc Streak.
     */
    public function getOtherUserId(int $userId): ?int
    {
        if ($this->user_a_id === $userId) return $this->user_b_id;
        if ($this->user_b_id === $userId) return $this->user_a_id;
        return null;
    }

    /**
     * Kiểm tra Streak hiện tại có đạt mốc quan trọng không (5, 10, 15, ...).
     *
     * @return bool True nếu streak >= 5 và chia hết cho 5.
     */
    public function isMilestone(): bool
    {
        return $this->current_streak >= 5 && $this->current_streak % 5 === 0;
    }

    /**
     * Lấy tên cấp bậc (tier) biểu tượng Streak dựa trên số ngày liên tiếp.
     *
     * @return string Tên cấp bậc: 'streak_5', 'streak_10', ..., 'streak_100', hoặc 'none'.
     */
    public function getMilestoneTier(): string
    {
        $streak = $this->current_streak;
        if ($streak >= 100) return 'streak_100';
        if ($streak >= 50) return 'streak_50';
        if ($streak >= 30) return 'streak_30';
        if ($streak >= 15) return 'streak_15';
        if ($streak >= 10) return 'streak_10';
        if ($streak >= 5) return 'streak_5';
        // BUG-04 FIX: Trả 'none' khi chưa đạt mốc nào (streak < 5)
        return 'none';
    }
}
