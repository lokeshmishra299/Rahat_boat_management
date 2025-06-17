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
         Schema::create('boat_inspections', function (Blueprint $table) {
        $table->id();
        $table->string('boat_registration_number')->unique();
        $table->date('inspection_date');
        $table->string('inspector_name');
        $table->string('inspector_id')->nullable();
        $table->enum('hull_condition',['Good','Fair','Poor']);
        $table->enum('engine_condition',['Excellent','Good','Fair','Poor']);
        $table->enum('safety_equipment',['Complete','Partial','Inadequate']);
        $table->json('inspection_checklist')->nullable();
        $table->enum('overall_status', ['Passed', 'Failed', 'Conditional Pass']);
        $table->text('recommendations')->nullable();
        $table->text('inspection_remarks')->nullable();

        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boat_inspections');
    }
};
