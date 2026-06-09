<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm trường 'category' cho nhóm cộng đồng.
 * Hỗ trợ phân loại nhóm theo: môn học, chuyên ngành, đồ án, NCKH, CLB, khác.
 * Cho phép tìm kiếm và lọc nhóm phù hợp trên trang Khám phá cộng đồng.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->string('category')->nullable()->after('join_type')
                  ->comment('subject|department|project|research|club|other');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
