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
        // dd($request->all());
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'password'       => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
            'role_id'        => 'required|exists:roles,id',
            'district_id'    => 'required|exists:districts,id',
            'designation_id'  => 'required|exists:designations,id',
                        'number'       => 'required|numeric|digits:10|unique:boat_owner,number',

        ], [
            'name.required'           => 'Full name is required.',
            'email.required'          => 'Email address is required.',
            'email.email'             => 'Please provide a valid email address.',
            'email.unique'            => 'This email is already registered.',

            'password.required'       => 'Password is required.',
            'password.min'            => 'Password must be at least 8 characters.',
            'password.confirmed'      => 'Password confirmation does not match.',
            'password.regex'          => 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.',

            'role_id.required'        => 'Please select a role.',
            'role_id.exists'          => 'Selected role is invalid.',
            'district_id.required'    => 'Please select a district.',
            'district_id.exists'      => 'Selected district is invalid.',
            'designation_id.required'  => 'Please select a designation.',
            'designation_id.exists'    => 'Selected designation is invalid.',
            'number.required'         => 'Please enter the mobile number.',
        'number.numeric'          => 'Mobile number must be numeric.',
        'number.digits'           => 'Mobile number must be exactly 10 digits.',
        'number.unique'           => 'This mobile number is already registered.',

        ]);


        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password1'      => $request->password, 
            'password'       => Hash::make($request->password),
            'role_id'        => $request->role_id,
            'district_id'    => $request->district_id,
            'designation_id'  => $request->designation_id,
            'number'         => $request->number
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully.',
            'data' => $user
        ]);
    }
}
