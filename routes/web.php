<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;

Route::get('/', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');;
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () { 

Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
Route::put('/roles/{id}', [RoleController::class, 'update'])->name('roles.update');
Route::get('/roles/delete/{id}', [RoleController::class, 'delete'])->name('roles.delete');
Route::get('/roles/{id}/permissions', [RoleController::class, 'permission_view'])->name('roles.assign.permission');
Route::PUT('/roles/{id}/permissions/store', [RoleController::class, 'Store_Permission'])->name('roles.assign.permission.store');
// user

Route::get('/User', [UserController::class, 'index'])->name('create.user');
Route::post('/User/Store', [UserController::class, 'store'])->name('store.user');
Route::get('/User/List', [UserController::class, 'show'])->name('user.list');
Route::get('/User/edit/{id}', [UserController::class, 'edit'])->name('user.edit');
Route::post('/user/update', [UserController::class, 'update'])->name('update.user');
Route::post('/users/update-status/{id}', [UserController::class, 'updateStatus'])->name('users.update.status');
Route::get('/User/delete/{id}', [UserController::class, 'delete'])->name('user.delete');

Route::get('/Dashboard', [HomeController::class, 'home'])->name('home');
Route::get('/district/dashboard', [HomeController::class, 'district_dashboard'])->name('district.dashboard');

Route::get('/Profile', [HomeController::class, 'Profile'])->name('profile');
Route::get('/add/boat', [HomeController::class, 'add_boat'])->name('add.boat');
Route::get('/boat/directory', [HomeController::class, 'boat_directory'])->name('boat.directory');

Route::get('/add/ghaat', [HomeController::class, 'add_ghaat'])->name('add.ghaat');
Route::get('/ghaat/directory', [HomeController::class, 'ghaat_directory'])->name('ghaat.directory');
Route::get('/Record/Distribution', [HomeController::class, 'Record_Distribution'])->name('record.distribution');
Route::get('/Distribution/Tracking', [HomeController::class, 'Distribution_Tracking'])->name('distribution.tracking');

Route::get('/Conduct/Inspection', [HomeController::class, 'Inspection'])->name('Inspection');
Route::get('/Inspection/Records', [HomeController::class, 'Records'])->name('Records');
Route::get('/Inspection/Schedule', [HomeController::class, 'Schedule'])->name('Schedule');
Route::get('/Inspection/Analytics', [HomeController::class, 'Analytics'])->name('Analytics');
});