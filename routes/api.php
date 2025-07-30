<?php

use App\Http\Controllers\Api\BoatManagement;
use App\Http\Controllers\Api\BoatOwnerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\GhaatController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\LifeJacketController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\PilotController;
use App\Http\Controllers\Api\RiverPortManagement;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::post('/forgot-password-check', [LoginController::class, 'forgotPasswordCheck']);
Route::post('/send-otp', [LoginController::class, 'sendOtp']);
Route::post('/verify-otp', [LoginController::class, 'verifyOtp']);
Route::post('/reset-password', [LoginController::class, 'resetPassword']);

Route::get('/reverse-geocode', [LocationController::class, 'reverseGeocode']);



Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user-profile', [LoginController::class, 'user']);
    Route::post('/logout', [LoginController::class, 'logout']);

    Route::get('/district-list', [BoatManagement::class, 'district_list']);
    Route::get('/get-tehsils', [BoatManagement::class, 'tehsil_list_by_district']);

    Route::get('/river-list', [GhaatController::class, 'river_list']);



    Route::post('/boat-owner/{id}/boats', [BoatManagement::class, 'store']);


    Route::get('/boat-list', [BoatManagement::class, 'index']);
    Route::get('/boat-list/{id}', [BoatManagement::class, 'view_list']);


    Route::post('/edit-boat-details/{id}', [BoatManagement::class, 'edit']);

    Route::get('total-boat-list', [BoatManagement::class, 'total_list']);

    Route::post('/boats-by-ghaat', [BoatManagement::class, 'boatsByGhaat']);

    Route::post('/register-ghaat', [GhaatController::class, 'store']);
    Route::get('/ghaat-list', [GhaatController::class, 'index']);
    Route::get('/ghaat-list/{id}', [GhaatController::class, 'view_list_individual']);

    Route::post('/edit-ghaat-details/{id}', [GhaatController::class, 'edit_ghaat']);

    Route::get('/districts-ghat', [DistrictController::class, 'index']);
    Route::get('/district-dashboard', [DistrictController::class, 'monitor_dashboard']);

    Route::post('/life-jackets', [LifeJacketController::class, 'store']);
    Route::get('/life-jackets-tracking', [LifeJacketController::class, 'distribuation_tracking']);
    Route::post('/ghaat-boat-count', [LifeJacketController::class, 'getBoatCountByGhat']);



    //Conduct inspection

    Route::post('/conduct-inspection', [InspectionController::class, 'conduct_inspection']);
    Route::post('/boat-id-lookup', [InspectionController::class, 'getBoatIdByRegistration']);

    Route::get('/conduct-inspection-records', [InspectionController::class, 'view_inspection']);
    Route::get('/boat-inspection/{id}', [InspectionController::class, 'view_inspection_by_id']);
    Route::post('/upcoming-inspections', [InspectionController::class, 'upcoming_inspections']);
    Route::get('/analytics', [InspectionController::class, 'analytics']);

    Route::get('/boat-registration-no', [InspectionController::class, 'registration_no_list']);
    


    //Dashboard

    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);

    Route::post('/users', [UserManagementController::class, 'store']);
    Route::get('/user-list', [UserManagementController::class, 'user_list']);
    Route::get('/user-list/{id}', [UserManagementController::class, 'user_list_id']);
    Route::post('/user-edit/{id}', [UserManagementController::class, 'user_edit']);
    Route::post('/update-password/{id}', [UserManagementController::class, 'update_password']);
    Route::delete('/user-delete/{id}', [UserManagementController::class, 'user_delete']);

    Route::post('/roles', [RoleController::class, 'store_roles']);
    Route::get('/roles', [RoleController::class, 'view_roles']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    Route::get('/designation', [RoleController::class, 'designation']);

    // Route::post('/resister-user',[])

    Route::post('/boat-owner', [BoatOwnerController::class, 'store']);
    Route::get('/boat-owner-list', [BoatOwnerController::class, 'directory']);

    Route::get('/boat-owner/{id}/boats', [BoatOwnerController::class, 'boatsByOwner']);

    Route::get('/boat-owner-list/{id}', [BoatOwnerController::class, 'owner_detail']);
    Route::post('/boat-owner-edit/{id}', [BoatOwnerController::class, 'edit_detail']);

    Route::get('/boat-owner/detail/{id}', [BoatOwnerController::class, 'list']);
    Route::put('/boat-owner/{id}', [BoatOwnerController::class, 'update']);

    //pilot

    Route::post('/pilot-store', [PilotController::class, 'store']);
    Route::get('/pilot-list', [PilotController::class, 'pilot_directory']);
    Route::get('/pilot-list/{id}', [PilotController::class, 'pilot_detail']);
    Route::post('/pilot-edit/{id}', [PilotController::class, 'pilot_edit']);


    //All boat and ghat details

    Route::get('/all-boat-ghat',[LocationController::class,'boat_ghat']);



});
