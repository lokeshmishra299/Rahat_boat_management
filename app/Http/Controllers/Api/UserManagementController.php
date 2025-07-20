<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\DistrictMaster;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str; 

class UserManagementController extends Controller
{
   public function store(Request $request)
{
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
        'district_id'    => 'required|exists:district_master,district_code',
        'designation_id' => 'required|exists:designations,id',
        'number'         => 'required|numeric|digits:10|unique:boat_owner,number',
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
        'designation_id.required' => 'Please select a designation.',
        'designation_id.exists'   => 'Selected designation is invalid.',
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

    $district = DistrictMaster::where('district_code', $request->district_id)->first();
    $shortDistrict = Str::slug(Str::words($district->district_name ?? 'user', 1, ''), '');

    $latestId = User::max('id') + 1;
    $username = ucfirst(substr($shortDistrict, 0, 3)) . str_pad($latestId, 3, '0', STR_PAD_LEFT);

    $user = User::create([
        'name'           => $request->name,
        'email'          => $request->email,
        'user_name'      => $username,
        'password1'      => $request->password,
        'password'       => Hash::make($request->password),
        'role_id'        => $request->role_id,
        'district_id'    => $request->district_id,
        'designation_id' => $request->designation_id,
        'number'         => $request->number
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'User created successfully.',
        'data' => $user
    ]);
}


public function user_list()
{
    $authUser = auth()->user();

    $query = User::with('district', 'designation', 'role');

    // If Admin (role_id is null) → show both 1 and 2
    if (is_null($authUser->role_id)) {
        $query->whereIn('role_id', [1, 2]);
    }

    // If role_id == 1 (district nodal) → show only role_id == 2
    elseif ($authUser->role_id == 1) {
        $query->where('role_id', 2);

        // Optional: restrict to same district
        $query->where('district_id', $authUser->district_id);
    }

    // For all other roles (including 2) → show nothing or customize as needed
    else {
        return ApiResponse::generateResponse('success', 'No access to user list', [], 200);
    }
    $query->orderBy('id', 'desc');

    $users = $query->get();

    return ApiResponse::generateResponse('success', 'User list fetch successfully', $users, 200);
}


    
     public function user_list_id($id){

        $user = User::with('district', 'designation', 'role')
        ->orderBy('id','desc')
        ->where('id', $id)->first();

        // dd($user);
        return ApiResponse::generateResponse('success','User list fetch successfully',$user,200);

    }

   public function user_edit(Request $request, $id)
{
    $user = User::find($id);

    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'User not found.'
        ], 404);
    }

    $validator = Validator::make($request->all(), [
        'name'           => 'required|string|max:255',
        'email'          => 'required|email|unique:users,email,' . $id,
       
        'role_id'        => 'required|exists:roles,id',
        'district_id'    => 'required|exists:districts,id',
        'designation_id' => 'required|exists:designations,id',
        'number'         => 'required|numeric|digits:10|unique:boat_owner,number,' . $id,
    ], [
        'name.required'           => 'Full name is required.',
        'email.required'          => 'Email address is required.',
        'email.email'             => 'Please provide a valid email address.',
        'email.unique'            => 'This email is already registered.',

        

        'role_id.required'        => 'Please select a role.',
        'role_id.exists'          => 'Selected role is invalid.',
        'district_id.required'    => 'Please select a district.',
        'district_id.exists'      => 'Selected district is invalid.',
        'designation_id.required' => 'Please select a designation.',
        'designation_id.exists'   => 'Selected designation is invalid.',

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

    // update user
    $user->name           = $request->name;
    $user->email          = $request->email;
    $user->role_id        = $request->role_id;
    $user->district_id    = $request->district_id;
    $user->designation_id = $request->designation_id;
    $user->number         = $request->number;

   

    $user->save();

    return response()->json([
        'status' => 'success',
        'message' => 'User updated successfully.',
        'data' => $user
    ]);
}


public function update_password(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'current_password' => 'required|string',
        'password' => [
            'required',
            'string',
            'min:6',
            'confirmed',
            'different:current_password',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{6,}$/',
        ],
    ], [
        'current_password.required' => 'Current password is required.',
        'password.required'         => 'New password is required.',
        'password.min'              => 'Password must be at least 6 characters.',
        'password.confirmed'        => 'Password confirmation does not match.',
        'password.different'        => 'New password must be different from the current password.',
        'password.regex'            => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed', $validator->errors(), 422);
    }

    $user = User::find($id);

    if (!$user) {
        return ApiResponse::generateResponse('error', 'User not found', null, 404);
    }

   if (!Hash::check($request->current_password, $user->password)) {
    return ApiResponse::generateResponse('error', 'Current password is incorrect.', null, 401);
}

if (Hash::check($request->password, $user->password)) {
    return ApiResponse::generateResponse('error', 'Validation failed', [
        'password' => ['New password must be different from the current password.']
    ], 422);
}


    $user->password1=$request->password;
    $user->password = Hash::make($request->password);
    $user->save();

    return ApiResponse::generateResponse('success', 'Password updated successfully', null, 200);
}

public function user_delete($id)
{
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $user->delete(); // This now sets deleted_at instead of hard delete

    return ApiResponse::generateResponse('success', 'User soft deleted successfully', null, 200);
}




}
