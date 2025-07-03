<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Pilot;
use App\Models\PilotFamily;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PilotController extends Controller
{
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name'             => 'required|string',
        'number'           => 'required|numeric|digits:10|unique:pilot,number',
        'email'            => 'nullable|email',
        'adhar'            => 'required|numeric|digits:12|unique:pilot,adhar',
        'dob'              => 'required|date',
        'no_of_boat'       => 'required|integer|min:1',
        'registration_no'  => 'required|string|unique:pilot,registration_no',
        'relation'         => 'nullable|string',

        'family'               => 'nullable|array',
        'family.*.name'        => 'required_with:family|string',
        'family.*.mobile'      => 'required_with:family|numeric|digits:10',
        'family.*.adhar'       => 'required_with:family|numeric|digits:12',
        'family.*.relation'    => 'required_with:family|string',
    ], [
        'number.unique'         => 'Mobile number already registered.',
        'adhar.unique'          => 'Aadhar number already registered.',
        'registration_no.unique'=> 'Registration number already exists.',

        'family.*.name.required_with'     => 'Family member name is required.',
        'family.*.mobile.required_with'   => 'Family member mobile is required.',
        'family.*.adhar.required_with'    => 'Family member Aadhar is required.',
        'family.*.relation.required_with' => 'Family member relation is required.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    $pilot = Pilot::create([
        'name'            => $request->name,
        'number'          => $request->number,
        'email'           => $request->email,
        'adhar'           => $request->adhar,
        'dob'             => $request->dob,
        'no_of_boat'      => $request->no_of_boat,
        'registration_no' => $request->registration_no,
        'relation'        => $request->relation,
    ]);

    if ($request->has('family')) {
        foreach ($request->family as $member) {
            $pilot->pilotFamily()->create([
                'name'     => $member['name'],
                'mobile'   => $member['mobile'],
                'adhar'    => $member['adhar'],
                'relation' => $member['relation'],
            ]);
        }
    }

    return ApiResponse::generateResponse(
        'success',
        'Pilot and family details saved successfully',
        $pilot->load('pilotFamily')
    );
}

public function pilot_directory(){

    $boatOwner=Pilot::with('district')->get();
    // dd($boatOwner);

    return ApiResponse::generateResponse('success','Boat Owner fetch successfully',$boatOwner,200);
}

public function pilot_detail($id){

    $pilotById=Pilot::with('district','pilotFamily')->where('id',$id)->first();


    return ApiResponse::generateResponse('success','Pilot details fetched successfully',$pilotById,200);
}

public function pilot_edit(Request $request, $id)
{
    $validator = Validator::make(array_merge($request->all(), ['id' => $id]), [
        'id'               => 'required|exists:pilot,id',
        'name'             => 'required|string',
        'number'           => 'required|numeric|digits:10|unique:pilot,number,' . $id,
        'email'            => 'nullable|email',
        'adhar'            => 'required|numeric|digits:12|unique:pilot,adhar,' . $id,
        'dob'              => 'required|date',
        'no_of_boat'       => 'required|integer|min:1',
        'registration_no'  => 'required|string|unique:pilot,registration_no,' . $id,
        'relation'         => 'nullable|string',

        // ✅ Input key from frontend: pilot_family_members
        'pilot_family_members'               => 'nullable|array',
        'pilot_family_members.*.id'          => 'nullable|integer|exists:pilot_family,id',
        'pilot_family_members.*.name'        => 'required_with:pilot_family_members|string',
        'pilot_family_members.*.mobile'      => 'required_with:pilot_family_members|numeric|digits:10',
        'pilot_family_members.*.adhar'       => 'required_with:pilot_family_members|numeric|digits:12',
        'pilot_family_members.*.relation'    => 'required_with:pilot_family_members|string',
    ], [
        'id.required'                              => 'Pilot ID is required.',
        'id.exists'                                => 'Pilot not found.',
        'number.unique'                            => 'Mobile number already registered.',
        'adhar.unique'                             => 'Aadhar number already registered.',
        'registration_no.unique'                   => 'Registration number already exists.',

        'pilot_family_members.*.id.exists'         => 'Invalid family member ID.',
        'pilot_family_members.*.name.required_with'     => 'Family member name is required.',
        'pilot_family_members.*.mobile.required_with'   => 'Family member mobile is required.',
        'pilot_family_members.*.adhar.required_with'    => 'Family member Aadhar is required.',
        'pilot_family_members.*.relation.required_with' => 'Family member relation is required.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    $pilot = Pilot::findOrFail($id);

    // ✅ Update pilot info
    $pilot->update([
        'name'            => $request->name,
        'number'          => $request->number,
        'email'           => $request->email,
        'adhar'           => $request->adhar,
        'dob'             => $request->dob,
        'no_of_boat'      => $request->no_of_boat,
        'registration_no' => $request->registration_no,
        'relation'        => $request->relation,
    ]);

    // ✅ Handle family members from correct key
    $submittedFamily = $request->pilot_family_members ?? [];

    // ✅ Current vs incoming IDs
    $currentIds = $pilot->pilotFamily()->pluck('id')->toArray();
    $incomingIds = collect($submittedFamily)->pluck('id')->filter()->toArray();
    $idsToDelete = array_diff($currentIds, $incomingIds);

    // 🗑 Delete removed family members
    if (!empty($idsToDelete)) {
        \App\Models\PilotFamily::whereIn('id', $idsToDelete)->delete();
    }

    // 🆕 Create or 📝 Update family members
    foreach ($submittedFamily as $member) {
        if (!empty($member['id'])) {
            \App\Models\PilotFamily::where('id', $member['id'])
                ->where('pilot_id', $pilot->id)
                ->update([
                    'name'     => $member['name'],
                    'mobile'   => $member['mobile'],
                    'adhar'    => $member['adhar'],
                    'relation' => $member['relation'],
                ]);
        } else {
            $pilot->pilotFamily()->create([
                'name'     => $member['name'],
                'mobile'   => $member['mobile'],
                'adhar'    => $member['adhar'],
                'relation' => $member['relation'],
            ]);
        }
    }

    return ApiResponse::generateResponse(
        'success',
        'Pilot and family details updated successfully',
        $pilot->load('pilotFamily')
    );
}



}
