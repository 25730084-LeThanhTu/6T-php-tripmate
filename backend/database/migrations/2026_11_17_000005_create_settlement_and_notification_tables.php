<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phân hệ Quyết toán & Thông báo (mục 4.6):
 * settlement_transactions, notifications.
 *
 * Ghi chú MySQL: không hỗ trợ partial index (WHERE is_read = FALSE)
 * nên dùng index ghép (user_id, is_read).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settlement_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('from_member_id')->constrained('trip_members')->cascadeOnDelete();
            $table->foreignId('to_member_id')->constrained('trip_members')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->enum('status', ['PENDING', 'SENT', 'CONFIRMED'])->default('PENDING');
            $table->string('proof_image_url', 500)->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
        });
        DB::statement('ALTER TABLE settlement_transactions ADD CONSTRAINT chk_settlement_amount CHECK (amount > 0)');
        DB::statement('ALTER TABLE settlement_transactions ADD CONSTRAINT chk_distinct_settlement_members CHECK (from_member_id <> to_member_id)');

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('trip_id')->nullable()->constrained('trips')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('title', 200);
            $table->text('content');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'is_read'], 'idx_notifications_user_unread');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('settlement_transactions');
    }
};
