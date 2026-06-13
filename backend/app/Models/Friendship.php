<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Quan hệ bạn bè (Friendship).
 *
 * Mỗi quan hệ bạn bè tạo ra MỘT bản ghi duy nhất (user_id → friend_id).
 * Khi kiểm tra bạn bè, cần query cả hai chiều (user_id, friend_id) hoặc (friend_id, user_id).
 */
class Friendship extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'friend_id'];

    /**
     * Người dùng sở hữu quan hệ bạn bè (phía chủ động).
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Người bạn trong quan hệ (phía bị động).
     */
    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }
}
