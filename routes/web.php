<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;

Route::get('/logina', [AuthController::class, 'showLoginForm'])->name('login');
