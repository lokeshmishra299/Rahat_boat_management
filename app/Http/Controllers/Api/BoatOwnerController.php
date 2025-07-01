<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatFamilyMember;
use App\Models\BoatOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BoatOwnerController extends Controller
{
   public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name'         => 'required|string',
        'district_id'  => 'required|exists:districts,id',
        'number'       => 'required|numeric|digits:10|unique:boat_owner,number',
        'email'        => 'nullable|email',
        'adhar_no'     => 'required|numeric|digits:12|unique:boat_owner,adhar_no',
        'dob'          => 'required|date',
        'boat_owned'   => 'required|integer|min:1',
        // 'address'      => 'required|string',
        'pincode'      => 'required|digits:6',

        'family'               => 'nullable|array',
        'family.*.name'        => 'required_with:family|string',
        // 'family.*.age'         => 'required_with:family|integer|min:1',
        'family.*.relation'    => 'required_with:family|string',
        'family.*.mobile'      => 'required_with:family|numeric|digits:10',
        'family.*.adhar'       => 'required_with:family|numeric|digits:12',

    ], [
        'name.required'           => 'Please enter the boat owner\'s name.',
        'district_id.required'    => 'Please select a district.',
        'district_id.exists'      => 'Selected district does not exist.',
        'number.required'         => 'Please enter the mobile number.',
        'number.numeric'          => 'Mobile number must be numeric.',
        'number.digits'           => 'Mobile number must be exactly 10 digits.',
        'number.unique'           => 'This mobile number is already registered.',
        'email.email'             => 'Please enter a valid email address.',
        'adhar_no.required'       => 'Please enter the Aadhar number.',
        'adhar_no.numeric'        => 'Aadhar number must be numeric.',
        'adhar_no.digits'         => 'Aadhar number must be exactly 12 digits.',
        'adhar_no.unique'         => 'This Aadhar number is already registered.',
        'dob.required'            => 'Please enter the date of birth.',
        'dob.date'                => 'Please enter a valid date of birth.',
        'boat_owned.required'     => 'Please enter how many boats are owned.',
        'boat_owned.integer'      => 'Number of boats must be a number.',
        'boat_owned.min'          => 'Boat count must be at least 1.',
        // 'address.required'        => 'Please enter the address.',
        'pincode.required'        => 'Please enter the pincode.',
        'pincode.digits'          => 'Pincode must be exactly 6 digits.',

        'family.*.name.required_with'     => 'Family member name is required.',
        'family.*.name.string'            => 'Family member name must be a string.',
        // 'family.*.age.required_with'      => 'Family member age is required.',
        // 'family.*.age.integer'            => 'Family member age must be a number.',
        // 'family.*.age.min'                => 'Family member age must be at least 1.',
        'family.*.relation.required_with' => 'Family member relation is required.',
        'family.*.relation.string'        => 'Family member relation must be a string.',
        'family.*.mobile.required_with'   => 'Family member mobile number is required.',
        'family.*.mobile.numeric'         => 'Family member mobile number must be numeric.',
        'family.*.mobile.digits'          => 'Family member mobile number must be exactly 10 digits.',
        'family.*.adhar.required_with'    => 'Family member Aadhar number is required.',
        'family.*.adhar.numeric'          => 'Family member Aadhar must be numeric.',
        'family.*.adhar.digits'           => 'Family member Aadhar must be exactly 12 digits.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    $owner = BoatOwner::create($request->only([
        'name',
        'district_id',
        'number',
        'email',
        'adhar_no',
        'dob',
        'boat_owned',
        'pincode',
        // 'address'
    ]));

    if ($request->has('family')) {
        foreach ($request->family as $member) {
            $owner->boatFamilyMembers()->create([
                'name'     => $member['name'],
                'adhar'    => $member['adhar'],
                'mobile'   => $member['mobile'],
                'relation' => $member['relation'],
            ]);
        }
    }

    return ApiResponse::generateResponse(
        'success',
        'Boat owner and family details saved successfully',
        $owner->load('boatFamilyMembers')
    );
}

public function directory(){

    $boatOwner=BoatOwner::with('district')->get();
    // dd($boatOwner);

    return ApiResponse::generateResponse('success','Boat Owner fetch successfully',$boatOwner,200);
}

public function owner_detail($id){

    $boatOwnerById=BoatOwner::with('district','boatFamilyMembers')->where('id',$id)->first();


    return ApiResponse::generateResponse('success','Boat Owner details',$boatOwnerById,200);
}

public function edit_detail(Request $request, $id)
{
    $validator = Validator::make(array_merge($request->all(), ['id' => $id]), [
        'id'           => 'required|exists:boat_owner,id',
        'name'         => 'required|string',
        'district_id'  => 'required|exists:districts,id',
        'number'       => 'required|numeric|digits:10|unique:boat_owner,number,' . $id,
        'email'        => 'nullable|email',
        'adhar_no'     => 'required|numeric|digits:12|unique:boat_owner,adhar_no,' . $id,
        'dob'          => 'required|date',
        'boat_owned'   => 'required|integer|min:1',
        'pincode'      => 'required|digits:6',
        'family'               => 'nullable|array',
        'family.*.id'          => 'nullable|integer|exists:boat_family_members,id',
        'family.*.name'        => 'required_with:family|string',
        'family.*.relation'    => 'required_with:family|string',
        'family.*.mobile'      => 'required_with:family|numeric|digits:10',
        'family.*.adhar'       => 'required_with:family|numeric|digits:12',
    ], [
        'id.required'          => 'Boat owner ID is required.',
        'id.exists'            => 'Boat owner not found.',
        'number.unique'        => 'This mobile number is already registered.',
        'adhar_no.unique'      => 'This Aadhar number is already registered.',
        'family.*.id.exists'   => 'Invalid family member ID.',
        'family.*.name.required_with'     => 'Family member name is required.',
        'family.*.relation.required_with' => 'Family member relation is required.',
        'family.*.mobile.required_with'   => 'Family member mobile number is required.',
        'family.*.adhar.required_with'    => 'Family member Aadhar number is required.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    $owner = BoatOwner::find($id);

    $owner->update([
        'name'         => $request->name,
        'district_id'  => $request->district_id,
        'number'       => $request->number,
        'email'        => $request->email,
        'adhar_no'     => $request->adhar_no,
        'dob'          => $request->dob,
        'boat_owned'   => $request->boat_owned,
        'pincode'      => $request->pincode,
    ]);

    $submittedFamily = $request->family ?? [];

    $currentIds = $owner->boatFamilyMembers()->pluck('id')->toArray();
    $incomingIds = collect($submittedFamily)->pluck('id')->filter()->toArray();
    $idsToDelete = array_diff($currentIds, $incomingIds);

    BoatFamilyMember::whereIn('id', $idsToDelete)->delete();

    foreach ($submittedFamily as $member) {
        if (isset($member['id'])) {
            $existing = BoatFamilyMember::where('id', $member['id'])
                ->where('boat_owner_id', $owner->id)
                ->first();

            if ($existing) {
                $existing->update([
                    'name'     => $member['name'],
                    'adhar'    => $member['adhar'],
                    'mobile'   => $member['mobile'],
                    'relation' => $member['relation'],
                ]);
            }
        } else {
            $owner->boatFamilyMembers()->create([
                'name'     => $member['name'],
                'adhar'    => $member['adhar'],
                'mobile'   => $member['mobile'],
                'relation' => $member['relation'],
            ]);
        }
    }

    return ApiResponse::generateResponse(
        'success',
        'Boat owner and family details updated successfully',
        $owner->load('boatFamilyMembers')
    );
}



}
