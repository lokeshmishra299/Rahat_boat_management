<?php

use App\Http\Controllers\Api\BoatManagement;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\GhaatController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\LifeJacketController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\RiverPortManagement;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user-profile', [LoginController::class, 'user']);
    Route::post('/logout',[LoginController::class,'logout']);

    Route::get('/district-list',[BoatManagement::class,'district_list']);
    Route::get('/river-list',[GhaatController::class,'river_list']);



    Route::post('/boats', [BoatManagement::class, 'store']);  
    Route::get('/boat-list', [BoatManagement::class, 'index']);  
    Route::get('/boat-list/{id}', [BoatManagement::class, 'view_list']);  

     
    Route::post('/edit-boat-details/{id}', [BoatManagement::class, 'edit']);   

    Route::post('/register-ghaat', [GhaatController::class, 'store']);
    Route::get('/ghaat-list', [GhaatController::class, 'index']);
        Route::get('/ghaat-list/{id}', [GhaatController::class, 'view_list_individual']);  

    Route::post('/edit-ghaat-details/{id}',[GhaatController::class,'edit_ghaat']);

    Route::get('/districts-ghat',[DistrictController::class,'index']);
    Route::get('/district-dashboard',[DistrictController::class,'monitor_dashboard']);

    Route::post('/life-jackets',[LifeJacketController::class,'store']);
    Route::get('/life-jackets-tracking',[LifeJacketController::class,'distribuation_tracking']);

    //Conduct inspection

    Route::post('/conduct-inspection',[InspectionController::class,'conduct_inspection']);
    Route::get('/conduct-inspection-records',[InspectionController::class,'view_inspection']);
    Route::get('/boat-inspection/{id}',[InspectionController::class,'view_inspection_by_id']);
    Route::get('/upcoming-inspections', [InspectionController::class, 'upcoming_inspections']);



    //Dashboard

    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);

    Route::post('/users', [UserManagementController::class, 'store']);





    

});
