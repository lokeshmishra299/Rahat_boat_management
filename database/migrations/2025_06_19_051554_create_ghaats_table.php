<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ghaats', function (Blueprint $table) {
            $table->id();

            $table->string('photo_path');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location')->nullable();
            $table->integer('pincode')->nullable();

            $table->string('ghaat_name');
            $table->foreignId('district_id')->constrained('district_master')->onDelete('cascade');

            $table->foreignId('river_id')->constrained('rivers')->onDelete('cascade');

            $table->unsignedInteger('boat_capacity');
            $table->string('road_accessibility')->nullable();
            $table->string('police_station_name')->nullable();
            $table->string('police_mobile')->nullable();
            $table->string('station_address')->nullable();

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // $table->string('contact_person');
            // $table->string('contact_number');

            $table->string('nearest_hospital');
            $table->text('available_facilities')->nullable();
            $table->text('additional_info')->nullable();
           $table->enum('status', ['0', '1', '2', '3'])->default('0')->comment('0=Operational, 1=Not operational, 2=Under maintenance, 3=Closed');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ghaats');
    }
};
