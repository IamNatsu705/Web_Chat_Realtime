<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Tin nhắn (Message).
 *
 * Đại diện cho một tin nhắn trong cuộc trò chuyện. Hỗ trợ các loại:
 * - 'text': Tin nhắn văn bản thông thường.
 * - 'image': Tin nhắn hình ảnh (content chứa đường dẫn file).
 * - 'file': Tin nhắn tài liệu (content chứa JSON metadata).
 * - 'system': Tin nhắn hệ thống (sender_id = null, VD: "A đã thêm B vào nhóm").
 *
 * Tính năng đặc biệt:
 * - Thu hồi (is_recalled): Tin nhắn đã bị thu hồi, nội dung bị thay thế.
 * - Xóa phía mình (deleted_by): Mảng chứa ID người dùng đã xóa tin nhắn này ở phía họ.
 */
class Message extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'sender_id', 'content', 'type', 'read_at', 'is_recalled', 'deleted_by'];

    protected $casts = [
        'read_at' => 'datetime',
        'is_recalled' => 'boolean',
        'deleted_by' => 'array',
    ];

    /**
     * Cuộc trò chuyện chứa tin nhắn này.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Người gửi tin nhắn (null nếu là tin nhắn hệ thống).
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Danh sách biên nhận đã đọc (dùng cho nhóm chat — theo dõi ai đã đọc tin nhắn nào).
     */
    public function readReceipts()
    {
        return $this->hasMany(MessageReadReceipt::class);
    }
}
