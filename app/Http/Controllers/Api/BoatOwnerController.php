<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatFamilyMember;
use App\Models\BoatOwner;
use App\Models\RegisterBoat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BoatOwnerController extends Controller
{
 public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name'         => 'required|string',
        'number'       => 'required|numeric|digits:10|unique:boat_owner,number',
        'email'        => 'required|email',
        'adhar_no'     => 'required|numeric|digits:12|unique:boat_owner,adhar_no',
        'dob'          => 'nullable|date',
        'boat_owned'   => 'nullable|integer|min:1',
        'district_id'  => 'required',

        'latitude'     => 'nullable|numeric',
        'longitude'    => 'nullable|numeric',
        'location'     => 'nullable|string',

        'owner_family_name'     => 'nullable|array',
        'owner_family_name.*'   => 'nullable|string',
        'pincode'               => 'nullable|string|max:10',
        'photo'                 => 'required|image|mimes:jpeg,png,jpg|max:2048',
    ], [
        'name.required'           => 'Please enter the boat owner\'s name.',
        'district_id.required'    => 'Please select a district.',
        'number.required'         => 'Please enter the mobile number.',
        'number.numeric'          => 'Mobile number must be numeric.',
        'number.digits'           => 'Mobile number must be exactly 10 digits.',
        'number.unique'           => 'This mobile number is already registered.',
        'email.email'             => 'Please enter a valid email address.',
        'adhar_no.required'       => 'Please enter the Aadhar number.',
        'adhar_no.numeric'        => 'Aadhar number must be numeric.',
        'adhar_no.digits'         => 'Aadhar number must be exactly 12 digits.',
        'adhar_no.unique'         => 'This Aadhar number is already registered.',
        'dob.date'                => 'Please enter a valid date of birth.',
        'boat_owned.integer'      => 'Number of boats must be a number.',
        'boat_owned.min'          => 'Boat count must be at least 1.',
        'latitude.numeric'        => 'Latitude must be numeric.',
        'longitude.numeric'       => 'Longitude must be numeric.',
        'location.string'         => 'Location must be a string.',
        'owner_family_name'       => 'Please enter family member name',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

  
    if (is_array($request->owner_family_name)) {
        $request->merge([
            'owner_family_name' => implode(', ', $request->owner_family_name),
        ]);
    }

   
    if ($request->hasFile('photo')) {
        $file = $request->file('photo');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('boat_owner_photos', $filename, 'public'); 
        $photoPath = 'storage/' . $path;
    } else {
        $photoPath = null;
    }

   
    $owner = BoatOwner::create([
        'name'              => $request->name,
        'district_id'       => $request->district_id,
        'number'            => $request->number,
        'email'             => $request->email,
        'adhar_no'          => $request->adhar_no,
        'dob'               => $request->dob,
        'boat_owned'        => $request->boat_owned,
        'latitude'          => $request->latitude,
        'longitude'         => $request->longitude,
        'location'          => $request->location,
        'owner_family_name' => $request->owner_family_name,
        'pincode'           => $request->pincode,
        'image'             => $photoPath,
    ]);

    return ApiResponse::generateResponse(
        'success',
        'Boat owner and family details saved successfully',
        $owner
    );
}


public function update(Request $request, $id)
{
    $owner = BoatOwner::find($id);

    if (!$owner) {
        return ApiResponse::generateResponse(
            'error',
            'Boat owner not found',
            null,
            404
        );
    }

    $validator = Validator::make($request->all(), [
        'name'         => 'required|string',
        'number'       => 'required|numeric|digits:10|unique:boat_owner,number,' . $id,
        'email'        => 'required|email',
        'adhar_no'     => 'required|numeric|digits:12|unique:boat_owner,adhar_no,' . $id,
        'dob'          => 'nullable|date',
        'boat_owned'   => 'nullable|integer|min:1',
        'district_id'  => 'required',

        'latitude'     => 'nullable|numeric',
        'longitude'    => 'nullable|numeric',
        'location'     => 'nullable|string',

        'owner_family_name'     => 'nullable|array',
        'owner_family_name.*'   => 'nullable|string',
        'pincode'               => 'nullable|string|max:10',
        'photo'                 => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ], [
        'name.required'           => 'Please enter the boat owner\'s name.',
        'district_id.required'    => 'Please select a district.',
        'number.required'         => 'Please enter the mobile number.',
        'number.numeric'          => 'Mobile number must be numeric.',
        'number.digits'           => 'Mobile number must be exactly 10 digits.',
        'number.unique'           => 'This mobile number is already registered.',
        'email.email'             => 'Please enter a valid email address.',
        'adhar_no.required'       => 'Please enter the Aadhar number.',
        'adhar_no.numeric'        => 'Aadhar number must be numeric.',
        'adhar_no.digits'         => 'Aadhar number must be exactly 12 digits.',
        'adhar_no.unique'         => 'This Aadhar number is already registered.',
        'dob.date'                => 'Please enter a valid date of birth.',
        'boat_owned.integer'      => 'Number of boats must be a number.',
        'boat_owned.min'          => 'Boat count must be at least 1.',
        'latitude.numeric'        => 'Latitude must be numeric.',
        'longitude.numeric'       => 'Longitude must be numeric.',
        'location.string'         => 'Location must be a string.',
        'owner_family_name'       => 'Please enter family member name',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    // Handle array of family names
    if (is_array($request->owner_family_name)) {
        $request->merge([
            'owner_family_name' => implode(', ', $request->owner_family_name),
        ]);
    }

    // Handle photo update if new photo uploaded
    if ($request->hasFile('photo')) {
        $file = $request->file('photo');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('boat_owner_photos', $filename, 'public'); 
        $photoPath = 'storage/' . $path;
    } else {
        $photoPath = $owner->image; // retain old image if not updated
    }

    $owner->update([
        'name'              => $request->name,
        'district_id'       => $request->district_id,
        'number'            => $request->number,
        'email'             => $request->email,
        'adhar_no'          => $request->adhar_no,
        'dob'               => $request->dob,
        'boat_owned'        => $request->boat_owned,
        'latitude'          => $request->latitude,
        'longitude'         => $request->longitude,
        'location'          => $request->location,
        'owner_family_name' => $request->owner_family_name,
        'pincode'           => $request->pincode,
        'image'             => $photoPath,
    ]);

    return ApiResponse::generateResponse(
        'success',
        'Boat owner details updated successfully',
        $owner
    );
}


public function list($id)
{
    $owner = BoatOwner::find($id);

    if (!$owner) {
        return ApiResponse::generateResponse(
            'error',
            'Boat owner not found',
            null,
            404
        );
    }

    $owner->owner_family_name = $owner->owner_family_name
        ? explode(', ', $owner->owner_family_name)
        : [];

    return ApiResponse::generateResponse(
        'success',
        'Boat owner data fetched successfully',
        $owner
    );
}




  public function directory()
{
    $user = auth()->user(); // Get logged-in user

    $boatOwnerQuery = BoatOwner::with('district')->withCount('boats');

    // If user is District Nodal Officer (role_id == 2), filter by their district_id
    if ($user->role_id == 2) {
        $boatOwnerQuery->where('district_id', $user->district_id);
    }

    $boatOwners = $boatOwnerQuery->get();

    return ApiResponse::generateResponse('success', 'Boat Owner fetch successfully', $boatOwners, 200);
}


public function boatsByOwner($boatOwnerId)
{
    $user = auth()->user();

    $query = RegisterBoat::with('district', 'ghaat');

    // Only allow boats of the district nodal officer's district
    if ($user->role_id == 2) {
        $query->where('district_id', $user->district_id);
    }

    // Filter boats by boat_owner_id
    $query->where('boat_owner_id', $boatOwnerId);

    $boats = $query->get();

    return ApiResponse::generateResponse('success', 'Boats fetched successfully', $boats, 200);
}


    public function owner_detail($id)
    {

        $boatOwnerById = BoatOwner::with('district', 'boatFamilyMembers')->where('id', $id)->first();


        return ApiResponse::generateResponse('success', 'Boat Owner details', $boatOwnerById, 200);
    }

  public function edit_detail(Request $request, $id)
{
    // dd($request->all());
    $validator = Validator::make(array_merge($request->all(), ['id' => $id]), [
        'id'                        => 'required|exists:boat_owner,id',
        'name'                      => 'required|string',
        // 'district_id'               => 'required|exists:districts,id',
        'number'                    => 'required|numeric|digits:10|unique:boat_owner,number,' . $id,
        'email'                     => 'nullable|email',
        'adhar_no'                  => 'required|numeric|digits:12|unique:boat_owner,adhar_no,' . $id,
        'dob'                       => 'nullable|date',
        'boat_owned'                => 'nullable|integer|min:1',
        // 'pincode'                   => 'nullable|digits:6',

        'owner_family_name'         => 'nullable|array',
        'owner_family_name.*'       => 'nullable|string',

        // 'family_members'               => 'nullable|array',
        // 'family_members.*.id'          => 'nullable|integer|exists:family_members,id',
        // 'family_members.*.name'        => 'required_with:family_members|string',
        // 'family_members.*.relation'    => 'required_with:family_members|string',
        // 'family_members.*.mobile'      => 'required_with:family_members|numeric|digits:10',
        // 'family_members.*.adhar'       => 'required_with:family_members|numeric|digits:12',
    ], [
        'id.required'                        => 'Boat owner ID is required.',
        'id.exists'                          => 'Boat owner not found.',
        'number.unique'                      => 'This mobile number is already registered.',
        'adhar_no.unique'                    => 'This Aadhar number is already registered.',
        // 'family_members.*.id.exists'         => 'Invalid family member ID.',
        // 'family_members.*.name.required_with'     => 'Family member name is required.',
        // 'family_members.*.relation.required_with' => 'Family member relation is required.',
        // 'family_members.*.mobile.required_with'   => 'Family member mobile number is required.',
        // 'family_members.*.adhar.required_with'    => 'Family member Aadhar number is required.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    $owner = BoatOwner::findOrFail($id);

    if (is_array($request->owner_family_name)) {
        $request->merge([
            'owner_family_name' => implode(', ', $request->owner_family_name),
        ]);
    }

   
    $owner->update([
        'name'               => $request->name,
        // 'district_id'      => $request->district_id,
        'number'             => $request->number,
        'email'              => $request->email,
        'adhar_no'           => $request->adhar_no,
        'dob'                => $request->dob,
        'boat_owned'         => $request->boat_owned,
        // 'pincode'          => $request->pincode,
        'owner_family_name'  => $request->owner_family_name,
    ]);

    // ✅ Family update logic (commented like in store)
    /*
    $submittedFamily = $request->family_members ?? [];

    // Get existing IDs
    $currentIds = $owner->boatFamilyMembers()->pluck('id')->toArray();
    $incomingIds = collect($submittedFamily)->pluck('id')->filter()->toArray();

    // Delete removed family members
    $idsToDelete = array_diff($currentIds, $incomingIds);
    if (!empty($idsToDelete)) {
        BoatFamilyMember::whereIn('id', $idsToDelete)->delete();
    }

    // Add/update family members
    foreach ($submittedFamily as $member) {
        if (!empty($member['id'])) {
            // Update existing
            BoatFamilyMember::where('id', $member['id'])
                ->where('boat_owner_id', $owner->id)
                ->update([
                    'name'     => $member['name'],
                    'adhar'    => $member['adhar'],
                    'mobile'   => $member['mobile'],
                    'relation' => $member['relation'],
                ]);
        } else {
            // Create new
            $owner->boatFamilyMembers()->create([
                'name'     => $member['name'],
                'adhar'    => $member['adhar'],
                'mobile'   => $member['mobile'],
                'relation' => $member['relation'],
            ]);
        }
    }
    */

    return ApiResponse::generateResponse(
        'success',
        'Boat owner details updated successfully',
        // $owner->load('boatFamilyMembers')
        $owner
    );
}

}
