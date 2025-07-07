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
        Schema::create('register_boats', function (Blueprint $table) {
            $table->id();
            $table->string('registration_no', 20)->unique();
            $table->foreignId('district_id')->constrained('districts')->onDelete('cascade');
            $table->string('image');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location')->nullable();
            $table->integer('pincode')->nullable();
            $table->string('boat_type');
            $table->string('pilot_name');
            $table->string('pilot_license_no', 50);
            $table->integer('support_staff');
            $table->string('engine_details');
            $table->integer('passenger_capacity');
            $table->string('year_of_manufacture');

            $table->foreignId('ghaat_id')->constrained('ghaats')->onDelete('cascade');

            $table->string('registration_authority');
            $table->string('owner_name')->nullable();
            $table->string('owner_email')->nullable();
            $table->string('owner_number')->nullable();
            $table->string('owner_adhar_no')->nullable();
            $table->string('owner_boat_owned')->nullable();
            $table->text('owner_address')->nullable();
            $table->string('owner_pincode')->nullable();
            $table->string('owner_family')->nullable();
            $table->string('owner_relation')->nullable();
            $table->date('owner_dob')->nullable();
            $table->string('owner_family_name');
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('register_boat');
    }
};
