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
        Schema::create('pilot', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('number');
            $table->string('email');
            $table->integer('no_of_boat');
            $table->string('registration_no');
            $table->string('family');
            $table->string('relation');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pilot');
    }
};
