<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phân hệ Chuyến đi & Thành viên (mục 4.1): trips, trip_members, trip_invitations.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED'])->default('PLANNING');
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();
        });
        DB::statement('ALTER TABLE trips ADD CONSTRAINT chk_trip_dates CHECK (end_date >= start_date)');

        Schema::create('trip_members', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['LEADER', 'CO_LEADER', 'MEMBER'])->default('MEMBER');
            $table->timestamp('joined_at')->useCurrent();

            $table->unique(['trip_id', 'user_id'], 'uq_trip_member');
            $table->index('user_id', 'idx_trip_members_user');
        });

        Schema::create('trip_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignUuid('inviter_id')->constrained('users');
            $table->string('invitee_email', 255)->nullable();
            $table->string('invite_code', 64)->unique();
            $table->enum('status', ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'])->default('PENDING');
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_invitations');
        Schema::dropIfExists('trip_members');
        Schema::dropIfExists('trips');
    }
};
