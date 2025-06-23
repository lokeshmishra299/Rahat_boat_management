<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'district_id' => 'required|exists:districts,id',
        'designation' => 'nullable|string|max:255',
        'role' => 'required|string|in:admin,user',
        'password' => 'required|string|min:6|confirmed',
    ], [
        'district_id.required' => 'District is required.',
        'district_id.exists' => 'Selected district does not exist.',
        'password.confirmed' => 'Passwords do not match.',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed.',
            'errors' => $validator->errors()
        ], 422);
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'district_id' => $request->district_id,
        'designation' => $request->designation,
        'role' => $request->role,
        'password' => Hash::make($request->password),
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'User created successfully.',
        'data' => $user
    ]);
}
}
