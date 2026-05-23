<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function userA()
    {
        return $this->belongsTo(User::class, 'user_a_id');
    }

    public function userB()
    {
        return $this->belongsTo(User::class, 'user_b_id');
    }

    /**
     * Check if the given user is user_a or user_b.
     * Returns 'a', 'b', or null.
     */
    public function getUserSide(int $userId): ?string
    {
        if ($this->user_a_id === $userId) return 'a';
        if ($this->user_b_id === $userId) return 'b';
        return null;
    }

    /**
     * Get the other user's ID.
     */
    public function getOtherUserId(int $userId): ?int
    {
        if ($this->user_a_id === $userId) return $this->user_b_id;
        if ($this->user_b_id === $userId) return $this->user_a_id;
        return null;
    }

    /**
     * Check if current streak has reached a milestone (5, 10, 15, ...).
     */
    public function isMilestone(): bool
    {
        return $this->current_streak >= 5 && $this->current_streak % 5 === 0;
    }

    /**
     * Get the milestone tier image name based on current streak.
     */
    public function getMilestoneTier(): string
    {
        $streak = $this->current_streak;
        if ($streak >= 100) return 'streak_100';
        if ($streak >= 50) return 'streak_50';
        if ($streak >= 30) return 'streak_30';
        if ($streak >= 15) return 'streak_15';
        if ($streak >= 10) return 'streak_10';
        return 'streak_5';
    }
}
