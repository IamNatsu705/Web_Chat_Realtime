<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Lời mời kết bạn (Friend Request).
 *
 * Lưu trữ lời mời kết bạn giữa hai người dùng với trạng thái 'pending'.
 * Khi được chấp nhận (accept): tạo bản ghi Friendship và xóa lời mời.
 * Khi bị từ chối (reject): xóa lời mời.
 */
class FriendRequest extends Model
{
    use HasFactory;

    protected $fillable = ['sender_id', 'receiver_id', 'status'];

    /**
     * Người gửi lời mời kết bạn.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Người nhận lời mời kết bạn.
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
