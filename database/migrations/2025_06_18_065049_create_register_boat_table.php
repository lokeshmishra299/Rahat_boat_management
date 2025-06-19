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
        $table->foreignId('district_id')->constrained('district')->onDelete('cascade');
        $table->string('image');
        $table->string('boat_type');
        $table->string('pilot_name');
        $table->string('pilot_license_no', 50);
        $table->integer('support_staff');
        $table->string('engine_details');
        $table->integer('passenger_capacity');
        $table->string('year_of_manufacture');

        $table->foreignId('ghaat_id')->constrained('ghaats')->onDelete('cascade');

        $table->string('registration_authority');
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
