<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_group', 'join_type', 'category', 'member_count', 'avatar', 'admin_id'];

    protected $casts = [
        'is_group' => 'boolean',
    ];

    public function participants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function streak()
    {
        return $this->hasOne(Streak::class);
    }

    /**
     * Yêu cầu tham gia nhóm (chỉ dùng cho join_type = 'request').
     */
    public function joinRequests()
    {
        return $this->hasMany(GroupJoinRequest::class);
    }

    /**
     * Tài liệu trong nhóm.
     */
    public function resources()
    {
        return $this->hasMany(GroupResource::class);
    }

    /**
     * Kiểm tra nhóm có phải dạng cộng đồng (mở hoặc yêu cầu) hay không.
     */
    public function isCommunity(): bool
    {
        return in_array($this->join_type, ['open', 'request']);
    }
}
