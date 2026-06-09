<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Tài liệu trong nhóm.
 * Tài liệu tồn tại vĩnh viễn — user mới tham gia nhóm vẫn xem được toàn bộ.
 * Không bị ảnh hưởng bởi cleared_at (chỉ áp dụng cho tin nhắn chat).
 */
class GroupResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'uploader_id',
        'title',
        'description',
        'file_url',
        'file_type',      // pdf, doc, image, link, other
        'file_size',       // bytes
        'category',        // exam, lecture, exercise, note, other
        'download_count',
        'is_pinned',
    ];

    protected $casts = [
        'file_size'      => 'integer',
        'download_count' => 'integer',
        'is_pinned'      => 'boolean',
    ];

    /**
     * Nhóm chứa tài liệu.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Người upload tài liệu.
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
