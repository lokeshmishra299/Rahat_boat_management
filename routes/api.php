<?php

use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/dashboard', [LoginController::class, 'user']);
    Route::post('/conduct-inspection',[InspectionController::class,'conduct_inspection']);

    

});
