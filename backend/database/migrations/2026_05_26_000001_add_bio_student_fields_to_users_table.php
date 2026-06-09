<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm các trường thông tin cá nhân cho sinh viên PTIT.
 * - bio: Mô tả bản thân (hiển thị trên profile)
 * - student_id: Mã sinh viên (VD: B21DCCN001)
 * - department: Khoa (VD: Công nghệ thông tin)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('avatar');
            $table->string('student_id')->nullable()->after('bio');
            $table->string('department')->nullable()->after('student_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'student_id', 'department']);
        });
    }
};
