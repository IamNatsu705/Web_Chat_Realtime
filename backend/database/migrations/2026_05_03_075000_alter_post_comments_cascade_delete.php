<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_comments', function (Blueprint $table) {
            // Drop old foreign key then re-create with cascadeOnDelete
            $table->dropForeign(['parent_id']);
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('post_comments')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('post_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('post_comments')
                  ->nullOnDelete();
        });
    }
};
