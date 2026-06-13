<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model Lượt thích bài đăng (Post Like).
 *
 * Mỗi bản ghi đại diện cho một lượt thích của một người dùng trên một bài đăng.
 * Không sử dụng timestamps tự động — chỉ lưu created_at thủ công.
 */
class PostLike extends Model
{
    /** Không sử dụng timestamps tự động. */
    public $timestamps = false;

    protected $fillable = ['post_id', 'user_id'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Bài đăng được thích.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Người dùng đã thích bài đăng.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
