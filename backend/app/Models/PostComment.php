<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Bình luận bài đăng (Post Comment).
 *
 * Hỗ trợ bình luận đa cấp (nested comments) thông qua trường parent_id.
 * Bình luận gốc có parent_id = null, bình luận trả lời có parent_id trỏ đến bình luận cha.
 */
class PostComment extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'user_id', 'parent_id', 'content'];

    /**
     * Bài đăng mà bình luận thuộc về.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Người dùng đã viết bình luận.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Bình luận cha (nếu đây là bình luận trả lời).
     */
    public function parent()
    {
        return $this->belongsTo(PostComment::class, 'parent_id');
    }

    /**
     * Danh sách bình luận con (trả lời bình luận này).
     */
    public function replies()
    {
        return $this->hasMany(PostComment::class, 'parent_id');
    }
}
