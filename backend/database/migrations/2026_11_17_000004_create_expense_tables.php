<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phân hệ Chi tiêu, Chia tiền & Kiểm toán (mục 4.5):
 * expense_categories, expenses, expense_splits, expense_receipts, expense_audit_logs.
 *
 * Ghi chú MySQL: JSONB (PostgreSQL) -> JSON.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100)->unique();
            $table->string('icon_name', 50);
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->unsignedInteger('category_id');
            $table->foreign('category_id')->references('id')->on('expense_categories');
            $table->foreignId('payer_member_id')->nullable()->constrained('trip_members');
            $table->boolean('is_from_fund')->default(false);
            $table->string('title', 200);
            $table->decimal('amount', 14, 2);
            $table->timestamp('expense_date');
            $table->enum('split_type', ['EQUAL', 'EXACT', 'PERCENT', 'SHARES'])->default('EQUAL');
            $table->text('notes')->nullable();
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['trip_id', 'expense_date'], 'idx_expenses_date');
        });
        DB::statement('ALTER TABLE expenses ADD CONSTRAINT chk_expense_amount CHECK (amount > 0)');
        DB::statement('ALTER TABLE expenses ADD CONSTRAINT chk_payer_or_fund CHECK (
            (is_from_fund = TRUE AND payer_member_id IS NULL) OR
            (is_from_fund = FALSE AND payer_member_id IS NOT NULL)
        )');

        Schema::create('expense_splits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->constrained('expenses')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('trip_members')->cascadeOnDelete();
            $table->decimal('split_value', 10, 2)->nullable();
            $table->decimal('calculated_amount', 14, 2);

            $table->unique(['expense_id', 'member_id'], 'uq_expense_member_split');
            $table->index('member_id', 'idx_expense_splits_member');
        });
        DB::statement('ALTER TABLE expense_splits ADD CONSTRAINT chk_calculated_amount CHECK (calculated_amount >= 0)');

        Schema::create('expense_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->constrained('expenses')->cascadeOnDelete();
            $table->string('image_url', 500);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('expense_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->constrained('expenses')->cascadeOnDelete();
            $table->foreignUuid('modified_by')->constrained('users');
            $table->enum('action', ['CREATED', 'UPDATED', 'DELETED']);
            $table->json('previous_data')->nullable();
            $table->json('new_data')->nullable();
            $table->string('reason', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_audit_logs');
        Schema::dropIfExists('expense_receipts');
        Schema::dropIfExists('expense_splits');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};
