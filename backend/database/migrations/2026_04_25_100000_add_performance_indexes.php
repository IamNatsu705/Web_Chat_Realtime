<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Performance indexes for chat queries.
     *
     * Key bottlenecks addressed:
     * - Messages query by conversation + time (pagination, unread count, cleared filter)
     * - Messages query by conversation + sender + read_at (unread count for 1-1)
     * - Friendship lookups in both directions
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // For: getMessages pagination, cleared_at filter, lastMessage
            $table->index(['conversation_id', 'created_at'], 'idx_messages_conv_created');
            // For: unread count in 1-1 chats (sender != user AND read_at IS NULL)
            $table->index(['conversation_id', 'sender_id', 'read_at'], 'idx_messages_conv_sender_read');
        });

        Schema::table('friendships', function (Blueprint $table) {
            // For: isFriend check in both directions
            $table->index(['user_id', 'friend_id'], 'idx_friendships_user_friend');
            $table->index(['friend_id', 'user_id'], 'idx_friendships_friend_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_messages_conv_created');
            $table->dropIndex('idx_messages_conv_sender_read');
        });

        Schema::table('friendships', function (Blueprint $table) {
            $table->dropIndex('idx_friendships_user_friend');
            $table->dropIndex('idx_friendships_friend_user');
        });
    }
};
