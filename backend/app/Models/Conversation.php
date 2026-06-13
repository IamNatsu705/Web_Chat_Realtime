<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Cuộc trò chuyện (Conversation).
 *
 * Đại diện cho một cuộc trò chuyện — có thể là chat 1-1 hoặc nhóm.
 * Nhóm có 3 loại tham gia (join_type): invite (riêng tư), open (mở), request (yêu cầu phê duyệt).
 * Nhóm open/request được gọi là "Cộng đồng" (Community).
 */
class Conversation extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_group', 'join_type', 'category', 'member_count', 'avatar', 'admin_id'];

    protected $casts = [
        'is_group' => 'boolean',
    ];

    /**
     * Danh sách thành viên tham gia cuộc trò chuyện.
     */
    public function participants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    /**
     * Tất cả tin nhắn trong cuộc trò chuyện.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Tin nhắn cuối cùng (mới nhất) trong cuộc trò chuyện.
     * Dùng để hiển thị preview trên Sidebar.
     */
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /**
     * Người quản trị (Admin/Owner) của nhóm chat.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Thông tin Streak (chuỗi ngày nhắn tin liên tiếp) — chỉ áp dụng cho chat 1-1.
     */
    public function streak()
    {
        return $this->hasOne(Streak::class);
    }

    /**
     * Danh sách yêu cầu tham gia nhóm (chỉ dùng cho join_type = 'request').
     */
    public function joinRequests()
    {
        return $this->hasMany(GroupJoinRequest::class);
    }

    /**
     * Danh sách tài liệu được chia sẻ trong nhóm.
     */
    public function resources()
    {
        return $this->hasMany(GroupResource::class);
    }

    /**
     * Kiểm tra nhóm có phải dạng cộng đồng (mở hoặc yêu cầu phê duyệt) hay không.
     *
     * @return bool True nếu join_type là 'open' hoặc 'request'.
     */
    public function isCommunity(): bool
    {
        return in_array($this->join_type, ['open', 'request']);
    }
}
