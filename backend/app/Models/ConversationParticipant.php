<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationParticipant extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'user_id', 'status', 'role', 'cleared_at'];

    protected $casts = [
        'cleared_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Kiểm tra người dùng là trưởng nhóm.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Kiểm tra người dùng là phó nhóm.
     */
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    /**
     * Kiểm tra người dùng là trưởng hoặc phó nhóm.
     */
    public function isOwnerOrMod(): bool
    {
        return in_array($this->role, ['owner', 'moderator']);
    }
}
