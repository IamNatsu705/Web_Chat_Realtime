<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model Biên nhận đã đọc (Message Read Receipt).
 *
 * Theo dõi trạng thái đọc tin nhắn trong nhóm chat.
 * Mỗi bản ghi ghi nhận rằng một người dùng cụ thể đã đọc một tin nhắn cụ thể.
 * Bảng cơ sở dữ liệu: 'message_reads'.
 */
class MessageReadReceipt extends Model
{
    /** Không sử dụng timestamps tự động (created_at, updated_at). */
    public $timestamps = false;

    protected $table = 'message_reads';

    protected $fillable = ['message_id', 'user_id', 'read_at'];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Tin nhắn được đánh dấu đã đọc.
     */
    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Người dùng đã đọc tin nhắn.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
