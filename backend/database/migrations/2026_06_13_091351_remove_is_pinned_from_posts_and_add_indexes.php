<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('is_pinned');
            $table->index(['status', 'created_at'], 'idx_posts_status_created_at');
            $table->index(['user_id', 'status', 'created_at'], 'idx_posts_user_status_created_at');
            $table->index('created_at', 'idx_posts_created_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('name', 'idx_users_name');
            $table->index(['role', 'is_banned'], 'idx_users_role_banned');
            $table->index('last_seen_at', 'idx_users_last_seen_at');
            $table->index('created_at', 'idx_users_created_at');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->index(['is_group', 'join_type', 'category'], 'idx_conversations_group_join_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex('idx_conversations_group_join_category');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_name');
            $table->dropIndex('idx_users_role_banned');
            $table->dropIndex('idx_users_last_seen_at');
            $table->dropIndex('idx_users_created_at');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('idx_posts_status_created_at');
            $table->dropIndex('idx_posts_user_status_created_at');
            $table->dropIndex('idx_posts_created_at');
            $table->boolean('is_pinned')->default(false);
        });
    }
};
