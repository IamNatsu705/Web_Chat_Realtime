<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model File đa phương tiện của bài đăng (Post Media).
 *
 * Lưu trữ đường dẫn ảnh/video đính kèm trong bài đăng.
 * Mỗi bài đăng có thể có nhiều file media, được sắp xếp theo sort_order.
 */
class PostMedia extends Model
{
    /** Không sử dụng timestamps tự động. */
    public $timestamps = false;

    protected $fillable = ['post_id', 'media_url', 'media_type', 'sort_order'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Bài đăng chứa file media này.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
