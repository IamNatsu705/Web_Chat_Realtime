<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Bài đăng (Post).
 *
 * Đại diện cho một bài đăng trên mạng xã hội nội bộ.
 * Hỗ trợ các tính năng: ghim bài (is_pinned), ẩn bài bởi admin (status = 'hidden'),
 * đếm lượt thích (likes_count), đếm bình luận (comments_count),
 * và đính kèm nhiều ảnh/video (PostMedia).
 */
class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'content', 'media_url',
        'likes_count', 'comments_count',
        'status',
        'hide_reason', 'hidden_by',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'comments_count' => 'integer',
    ];

    /**
     * Người dùng đã tạo bài đăng.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quản trị viên đã ẩn bài đăng (nếu có).
     */
    public function hiddenByAdmin()
    {
        return $this->belongsTo(User::class, 'hidden_by');
    }

    /**
     * Danh sách lượt thích của bài đăng.
     */
    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }

    /**
     * Danh sách bình luận của bài đăng.
     */
    public function comments()
    {
        return $this->hasMany(PostComment::class);
    }

    /**
     * Danh sách file đa phương tiện (ảnh, video) đính kèm, sắp xếp theo thứ tự.
     */
    public function media()
    {
        return $this->hasMany(PostMedia::class)->orderBy('sort_order');
    }
}
