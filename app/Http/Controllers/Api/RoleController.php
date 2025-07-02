<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Designation;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
     public function store_roles(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        $role = Role::create([
            'name' => $request->name,
        ]);

       return ApiResponse::generateResponse('success','Role Added Successfully!',$role,200);
    }
public function view_roles()
{
    $user = auth()->user();

    if ($user && $user->role && $user->role->name === 'district_nodal') {
        $roles = Role::where('name', 'ghaat_nodal')->get();
    } else {
        $roles = Role::all();
    }

    return ApiResponse::generateResponse('success','Role list fetched successfully',$roles,200);
    
}


public function update(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|unique:roles,name,' . $id,
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    $role = Role::find($id);
    if (!$role) {
        return response()->json([
            'status' => 'error',
            'message' => 'Role not found',
        ], 404);
    }

    $role->name = $request->name;
    $role->save();

    return response()->json([
        'status' => 'success',
        'message' => 'Role updated successfully',
        'role' => $role
    ]);
}

public function destroy($id)
{
    $role = Role::find($id);

    if (!$role) {
        return response()->json(['message' => 'Role not found'], 404);
    }

    $role->delete();

    return ApiResponse::generateResponse('success','Role Deleted Successfully!');
}

public function designation()
{
    $user = auth()->user();

    if ($user && $user->role && $user->role->name === 'district_nodal') {
        $designation = Designation::where('name', 'Ghaat Nodal')
            ->select('id', 'name')
            ->get();
    } else {
        $designation = Designation::select('id', 'name')->get();
    }

    return ApiResponse::generateResponse('success', 'Designation Fetch Successfully', $designation);
}


}
