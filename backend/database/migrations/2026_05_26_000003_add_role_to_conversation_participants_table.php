<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm trường role vào bảng conversation_participants để phân quyền trong nhóm.
 * - owner: Trưởng nhóm (toàn quyền)
 * - moderator: Phó nhóm (duyệt yêu cầu, kick member, xóa tài liệu)
 * - member: Thành viên (chat, xem/upload tài liệu)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->string('role')->default('member')->after('status'); // owner | moderator | member
        });
    }

    public function down(): void
    {
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
