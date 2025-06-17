<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use App\Models\District;

class UserController extends Controller
{


public function index()
{
    $page_title = 'Create User';
    $roles = Role::all();
    $districts = District::all();
    $user = null;
    return view('admin.user_management.new_user', compact('page_title','user','districts','roles'));
}

public function edit($id)
{
    $page_title = 'Update User';
    $roles = Role::all();
    $districts = District::all();
    $user = User::where('id', $id)->first();

    return view('admin.user_management.new_user', compact('page_title','user','districts','roles'));
}


public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email:rfc,dns|unique:users,email|max:255',
        'role_id' => 'required|exists:roles,id',
        'district_id' => 'required|exists:districts_master,id',
        'designation' => 'nullable|string|max:255',
        'password' => [
            'required',
            'confirmed',
            'min:8','regex:/[a-z]/',     
            'regex:/[A-Z]/',           
            'regex:/[0-9]/',           
            'regex:/[@$!%*#?&]/',      
        ],
    ]);

    $user = new User();
    $user->name = $request['name'];
    $user->email = filter_var($request['email'], FILTER_SANITIZE_EMAIL);
    $user->role_id = $request['role_id'];
    $user->district_id = $request['district_id'];
    $user->designation = $request['designation'];
    $user->password = bcrypt($request['password']);    

    $roleName = Role::find($request['role_id'])->name ?? null;
    if ($roleName) {
        $user->save();
        $user->assignRole($roleName);
    }

    return redirect()->back()->with('success', 'User created successfully!');
}


public function update(Request $request)
{
  $id= $request->id ?? null;
    $request->validate([
        'id' => 'required|exists:users,id',
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $id,
        'role_id' => 'required|exists:roles,id',
        'district_id' => 'required|exists:districts_master,id',
        'designation' => 'required|string|max:255',
        'password' => [
            'nullable',
            'confirmed',
            'min:8',
            'regex:/[a-z]/',       
            'regex:/[A-Z]/',       
            'regex:/[0-9]/',      
            'regex:/[@$!%*#?&]/', 
        ],
    ]);

    $user = User::where('id',$id)->first();
    $user->name = $request->name;
    $user->email = $request->email;
    $user->role_id = $request->role_id;
    $user->district_id = $request->district_id;
    $user->designation = $request->designation;

     $roleName = Role::find($request['role_id'])->name ?? null;
    if ($roleName) {
        $user->syncRoles([$roleName]);
    }
    

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    return redirect()->route('user.list')->with('success', 'User updated successfully.');
}


public function show()
{
    $page_title = 'User List';
    $users = User::with(['roles', 'district'])->get();

    return view('admin.user_management.user_list', compact('page_title','users'));
}

public function updateStatus(Request $request, $id)
{
    $user = User::findOrFail($id);
    $user->status = $request->status;
    $user->save();
    return response()->json([
        'success' => true,
        'message' => 'User status updated successfully.'
    ]);
}

public function delete($id)
{
    $role = User::findOrFail($id);
    $role->delete();
    return redirect()->back()->with('success', 'User deleted successfully.');
}

    
}
