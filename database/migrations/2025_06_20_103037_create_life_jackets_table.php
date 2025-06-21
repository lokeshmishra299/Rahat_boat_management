<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 
     public function up(): void
    {
        Schema::create('life_jackets', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('ghaat_id');
            $table->unsignedBigInteger('district_id');

            $table->integer('no_of_boats');
            $table->integer('jackets_per_boat');
            $table->integer('total_jackets');
            
            $table->string('distribution_date');
            $table->string('received_by');
            $table->string('phone');
            $table->string('distribution_notes');
            $table->integer('total_allocated_jackets');
            $table->enum('status', ['0', '1'])->default('0')->comment('0=Completed, 1=Pending');
            $table->timestamps();
            $table->foreign('district_id')
                  ->references('id')
                  ->on('districts')
                  ->onDelete('cascade');

            $table->foreign('ghaat_id')
                  ->references('id')
                  ->on('ghaats')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('life_jackets');
    }

};
