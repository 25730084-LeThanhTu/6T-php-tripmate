<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phân hệ Ngân sách & Quỹ chung (mục 4.4):
 * budgets, budget_categories, shared_funds, fund_contributions.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->unique()->constrained('trips')->cascadeOnDelete();
            $table->decimal('total_budget', 14, 2);
            $table->boolean('alert_80_sent')->default(false);
            $table->boolean('alert_100_sent')->default(false);
            $table->timestamps();
        });
        DB::statement('ALTER TABLE budgets ADD CONSTRAINT chk_total_budget CHECK (total_budget > 0)');

        Schema::create('budget_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('budgets')->cascadeOnDelete();
            $table->string('name', 100);
            $table->decimal('allocated_amount', 14, 2);
        });
        DB::statement('ALTER TABLE budget_categories ADD CONSTRAINT chk_allocated_amount CHECK (allocated_amount > 0)');

        Schema::create('shared_funds', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->unique()->constrained('trips')->cascadeOnDelete();
            $table->decimal('current_balance', 14, 2)->default(0);
        });

        Schema::create('fund_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fund_id')->constrained('shared_funds')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('trip_members')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('payment_method', 50);
            $table->string('notes', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
        DB::statement('ALTER TABLE fund_contributions ADD CONSTRAINT chk_contribution_amount CHECK (amount > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_contributions');
        Schema::dropIfExists('shared_funds');
        Schema::dropIfExists('budget_categories');
        Schema::dropIfExists('budgets');
    }
};
