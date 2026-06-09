<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mở rộng bảng conversations để hỗ trợ Community Groups.
 * - description: Mô tả nhóm (cho trang khám phá)
 * - join_type: Cách tham gia nhóm ('invite' = chỉ mời, 'open' = tự do, 'request' = cần duyệt)
 * - member_count: Cache đếm thành viên (tránh COUNT mỗi lần hiển thị)
 *
 * Group chat cũ (private) giữ nguyên join_type = 'invite' (default).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->string('join_type')->default('invite')->after('is_group'); // invite | open | request
            $table->unsignedInteger('member_count')->default(0)->after('join_type');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['description', 'join_type', 'member_count']);
        });
    }
};
