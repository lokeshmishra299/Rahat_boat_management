<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
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
            'number' => 'required|numeric|digits:10|unique:boat_owner,number',
            'email'        => 'nullable|email',
            'adhar_no'     => 'required|numeric|digits:12|unique:boat_owner,adhar_no',
            'boat_owned'   => 'required|integer|min:1',
            'address'      => 'required|string',
            'pincode'      => 'required|digits:6',

            'family'               => 'nullable|array',
            'family.*.name'        => 'required_with:family|string',
            'family.*.age'         => 'required_with:family|integer|min:1',
            'family.*.relation'    => 'required_with:family|string',
        ], [
            'name.required'           => 'Please enter the boat owner\'s name.',
            'district_id.required'    => 'Please select a district.',
            'district_id.exists'      => 'Selected district does not exist.',
            'number.required' => 'Please enter the mobile number.',
            'number.numeric' => 'Mobile number must be numeric.',
            'number.digits' => 'Mobile number must be exactly 10 digits.',
            'number.unique' => 'This mobile number is already registered.',
            'email.email'             => 'Please enter a valid email address.',
            'adhar_no.required'       => 'Please enter the Aadhar number.',
            'adhar_no.numeric'        => 'Aadhar number must be numeric.',
            'adhar_no.digits'         => 'Aadhar number must be exactly 12 digits.',
            'adhar_no.unique'         => 'This Aadhar number is already registered.',
            'boat_owned.required'     => 'Please enter how many boats are owned.',
            'boat_owned.integer'      => 'Number of boats must be a number.',
            'boat_owned.min'          => 'Boat count must be at least 1.',
            'address.required'        => 'Please enter the address.',
            'pincode.required'        => 'Please enter the pincode.',
            'pincode.digits'          => 'Pincode must be exactly 6 digits.',

            'family.*.name.required_with'     => 'Family member name is required.',
            'family.*.name.string'            => 'Family member name must be a string.',
            'family.*.age.required_with'      => 'Family member age is required.',
            'family.*.age.integer'            => 'Family member age must be a number.',
            'family.*.age.min'                => 'Family member age must be at least 1.',
            'family.*.relation.required_with' => 'Family member relation is required.',
            'family.*.relation.string'        => 'Family member relation must be a string.',
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
            'boat_owned',
            'address',
            'pincode'
        ]));

        if ($request->has('family')) {
            foreach ($request->family as $member) {
                $owner->boatFamilyMembers()->create([
                    'name'     => $member['name'],
                    'age'      => $member['age'],
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
}
