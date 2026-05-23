<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FK constraint, make nullable, re-add FK
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['sender_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('sender_id')->nullable()->change();
            $table->foreign('sender_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        // Revert: remove nulls first, then re-add non-nullable FK
        DB::table('messages')->whereNull('sender_id')->update(['sender_id' => 1]);

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['sender_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('sender_id')->nullable(false)->change();
            $table->foreign('sender_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
