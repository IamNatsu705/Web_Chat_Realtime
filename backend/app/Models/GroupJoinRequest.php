<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Yêu cầu tham gia nhóm.
 * Chỉ sử dụng cho nhóm có join_type = 'request'.
 * Trưởng/Phó nhóm duyệt hoặc từ chối yêu cầu.
 */
class GroupJoinRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'status',       // pending | approved | rejected
        'reviewed_by',
    ];

    /**
     * Nhóm mà yêu cầu được gửi đến.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Người gửi yêu cầu.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Người duyệt yêu cầu (trưởng/phó nhóm).
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
