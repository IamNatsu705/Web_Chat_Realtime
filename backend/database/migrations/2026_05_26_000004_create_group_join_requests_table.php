<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bảng lưu yêu cầu tham gia nhóm.
 * Chỉ dùng cho nhóm có join_type = 'request'.
 * Khi trưởng/phó nhóm duyệt, bản ghi được cập nhật status và user được thêm vào participants.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending'); // pending | approved | rejected
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Mỗi user chỉ có 1 yêu cầu pending cho 1 nhóm tại một thời điểm
            $table->unique(['conversation_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_join_requests');
    }
};
