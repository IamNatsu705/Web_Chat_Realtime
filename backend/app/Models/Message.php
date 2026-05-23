<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'sender_id', 'content', 'type', 'read_at', 'is_recalled', 'deleted_by'];

    protected $casts = [
        'read_at' => 'datetime',
        'is_recalled' => 'boolean',
        'deleted_by' => 'array',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function readReceipts()
    {
        return $this->hasMany(MessageReadReceipt::class);
    }
}
