<?php

use App\Http\Controllers\Api\BoatManagement;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user-profile', [LoginController::class, 'user']);
    Route::post('/logout',[LoginController::class,'logout']);
    Route::post('/conduct-inspection',[InspectionController::class,'conduct_inspection']);
    Route::get('/district-list',[BoatManagement::class,'district_list']);
    Route::post('/boats', [BoatManagement::class, 'store']);  
    Route::get('/boat-list', [BoatManagement::class, 'index']);   
    Route::post('/edit-boat-details/{id}', [BoatManagement::class, 'edit']);   


    

});
