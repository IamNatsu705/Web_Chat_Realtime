<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bảng lưu trữ tài liệu trong nhóm.
 * Tài liệu tồn tại vĩnh viễn trong nhóm — user mới tham gia vẫn xem được toàn bộ.
 * Không bị ảnh hưởng bởi cleared_at (chỉ áp dụng cho tin nhắn chat).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploader_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_url');
            $table->string('file_type')->default('other'); // pdf, doc, image, link, other
            $table->unsignedBigInteger('file_size')->default(0); // bytes
            $table->string('category')->default('other'); // exam, lecture, exercise, note, other
            $table->unsignedInteger('download_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();

            // Index cho tìm kiếm và lọc tài liệu theo nhóm + danh mục
            $table->index(['conversation_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_resources');
    }
};
