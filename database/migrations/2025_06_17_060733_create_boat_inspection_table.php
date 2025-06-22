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
        Schema::create('boat_inspection', function (Blueprint $table) {
            $table->id();
            $table->foreignId('register_boat_id')->constrained('register_boats')->onDelete('cascade');
            $table->date('inspection_date');
            $table->string('inspector_name');
            $table->string('inspector_id')->nullable();

            $table->string('hull_condition');
            $table->string('engine_condition');
            $table->string('safety_equipment');
            $table->json('inspection_checklist')->nullable();
            $table->string('overall_status');
            $table->text('recommendations')->nullable();
            $table->text('inspection_remarks')->nullable();
            $table->enum('status', ['0', '1'])->default('0')->comment('0=Passed, 1=Failed');


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
