<?php

use App\Http\Controllers\Api\BoatManagement;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\GhaatController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\RiverPortManagement;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user-profile', [LoginController::class, 'user']);
    Route::post('/logout',[LoginController::class,'logout']);
    Route::post('/conduct-inspection',[InspectionController::class,'conduct_inspection']);


    Route::get('/district-list',[BoatManagement::class,'district_list']);
    Route::get('/river-list',[GhaatController::class,'river_list']);



    Route::post('/boats', [BoatManagement::class, 'store']);  
    Route::get('/boat-list', [BoatManagement::class, 'index']);   
    Route::post('/edit-boat-details/{id}', [BoatManagement::class, 'edit']);   

    Route::post('/register-ghaat', [GhaatController::class, 'store']);
    Route::get('/ghaat-list', [GhaatController::class, 'index']);
    Route::post('/edit-ghaat-details/{id}',[GhaatController::class,'edit_ghaat']);

    Route::get('/districts-ghat',[DistrictController::class,'index']);
    

});
