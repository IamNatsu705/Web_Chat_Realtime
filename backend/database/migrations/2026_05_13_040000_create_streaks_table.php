<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_a_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_b_id')->constrained('users')->onDelete('cascade');
            $table->unsignedInteger('current_streak')->default(0);
            $table->date('last_completed_date')->nullable();
            $table->date('user_a_last_msg_date')->nullable();
            $table->date('user_b_last_msg_date')->nullable();
            $table->unsignedTinyInteger('restore_days')->default(0);
            $table->enum('status', ['active', 'pending_restore', 'lost'])->default('active');
            $table->timestamps();

            $table->unique('conversation_id');
            $table->index(['status', 'current_streak']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('streaks');
    }
};
