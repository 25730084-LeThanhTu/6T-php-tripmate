<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phân hệ Lịch trình (mục 4.2) và Album ảnh (mục 4.3):
 * itinerary_days, itinerary_items, trip_photos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('itinerary_days', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->integer('day_number');
            $table->date('date');

            $table->unique(['trip_id', 'day_number'], 'uq_trip_day_number');
            $table->unique(['trip_id', 'date'], 'uq_trip_day_date');
        });

        Schema::create('itinerary_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('day_id')->constrained('itinerary_days')->cascadeOnDelete();
            $table->string('title', 200);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location_name', 255)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('estimated_cost', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->integer('order_index')->default(0);
        });

        Schema::create('trip_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignUuid('uploader_id')->constrained('users');
            $table->string('photo_url', 500);
            $table->string('thumbnail_url', 500)->nullable();
            $table->date('taken_date')->nullable();
            $table->string('caption', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_photos');
        Schema::dropIfExists('itinerary_items');
        Schema::dropIfExists('itinerary_days');
    }
};
