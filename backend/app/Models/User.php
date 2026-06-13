<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model Người dùng (User) — Đại diện cho tài khoản người dùng trong hệ thống.
 *
 * Quản lý thông tin cá nhân, xác thực (Sanctum Token), và các mối quan hệ
 * với bạn bè, cuộc trò chuyện, tin nhắn, bài đăng.
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Các trường cho phép gán hàng loạt (Mass Assignment).
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'bio',
        'student_id',
        'department',
        'role',
        'is_banned',
        'banned_at',
        'ban_reason',
        'last_seen_at',
    ];

    /**
     * Các trường bị ẩn khi chuyển đổi sang mảng hoặc JSON (Serialization).
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Định nghĩa kiểu dữ liệu (Type Casting) cho các trường.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_banned' => 'boolean',
            'banned_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * Kiểm tra người dùng có phải là Quản trị viên (Admin) hay không.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Danh sách lời mời kết bạn mà người dùng đã gửi đi.
     */
    public function friendRequestsSent()
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    /**
     * Danh sách lời mời kết bạn mà người dùng đã nhận được.
     */
    public function friendRequestsReceived()
    {
        return $this->hasMany(FriendRequest::class, 'receiver_id');
    }

    /**
     * Danh sách quan hệ bạn bè (chiều đi: user_id = id hiện tại).
     */
    public function friendships()
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    /**
     * Danh sách các cuộc trò chuyện mà người dùng đang tham gia.
     */
    public function conversationParticipations()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    /**
     * Danh sách tin nhắn mà người dùng đã gửi.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Danh sách bài đăng (Post) mà người dùng đã tạo.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
