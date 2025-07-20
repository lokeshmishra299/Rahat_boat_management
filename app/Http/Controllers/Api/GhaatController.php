<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\DistrictMaster;
use Illuminate\Http\Request;
use App\Models\Ghaat; // make sure this import exists
use App\Models\River;
use Illuminate\Support\Facades\Storage;

class GhaatController extends Controller
{


    public function river_list()
    {

        $rivers = River::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();
        // dd($river->toArray());

        return ApiResponse::generateResponse('success', 'River list fetched successfully', $rivers);
    }

 public function store(Request $request)
{
    $request->validate([
        'photo_path' => 'required|image|mimes:jpeg,jpg,png|max:5120',
        'ghaat_name' => 'required|string',
        'district_id' => 'required',
        'river_id' => 'required|exists:rivers,id',
        'police_station_name' => 'required|string',
        'police_mobile' => 'required|digits:10',
        'station_address' => 'required|string',
        'road_accessibility' => 'nullable|string',
        'nearest_hospital' => 'required|string',
        'available_facilities' => 'nullable|string',
        'additional_info' => 'nullable|string',
        'location' => 'nullable|string',
    ], [
        // Custom messages here...
    ]);

    $image = $request->file('photo_path');
    $photoPath = $image->store('photos', 'public');

    // Step 1: Create Ghaat without UID
    $ghaat = Ghaat::create([
        'photo_path' => $photoPath,
        'latitude' => $request->latitude,
        'longitude' => $request->longitude,
        'pincode' => $request->pincode,
        'location' => $request->location,
        'ghaat_name' => $request->ghaat_name,
        'district_id' => $request->district_id,
        'river_id' => $request->river_id,
        'police_station_name' => $request->police_station_name,
        'police_mobile' => $request->police_mobile,
        'station_address' => $request->station_address,
        'road_accessibility' => $request->road_accessibility,
        'nearest_hospital' => $request->nearest_hospital,
        'available_facilities' => $request->available_facilities,
        'additional_info' => $request->additional_info,
        'user_id' => auth()->id(),
    ]);

 
    $districtId = $request->district_id;
    $ghaatId = $ghaat->id;
    $ghatUid = sprintf('GH-%s-%04d', $districtId, $ghaatId);

    
    $ghaat->update([
        'ghat_uid' => $ghatUid
    ]);

    return ApiResponse::generateResponse(
        'success',
        'Ghaat registered successfully',
        $ghaat,
        201
    );
}


public function index()
{
    $ghaats = Ghaat::with([
        'district_record:id,district_code,district_name',
        'river:id,name'
    ])->get();

    return ApiResponse::generateResponse(
        'success',
        'Ghaat list fetched successfully',
        $ghaats,
        200
 );
}

    public function view_list_individual(Request $request, $id)
    {
        $ghaat = Ghaat::with(['district_record:id,district_name', 'river_record:id,name'])
            ->where('id', $id)
            ->first();

        if (!$ghaat) {
            return ApiResponse::generateResponse('error', 'Ghaat not found.', [], 404);
        }

        return ApiResponse::generateResponse('success', 'Ghaat fetched successfully.', $ghaat);
    }



public function edit_ghaat(Request $request, $id)
{
    $ghaat = Ghaat::find($id);

    if (!$ghaat) {
        return ApiResponse::generateResponse('error', 'Ghaat not found', [], 404);
    }

    $request->validate([
        'photo_path' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        'ghaat_name' => 'required|string',
        'district_id' => 'required|string',
        'river_id' => 'required|exists:rivers,id',
        'road_accessibility' => 'nullable|string',
        'nearest_hospital' => 'required|string',
        'available_facilities' => 'nullable|string',
        'additional_info' => 'nullable|string',
        'location' => 'nullable|string',
        'latitude' => 'nullable|numeric',
        'longitude' => 'nullable|numeric',
        'pincode' => 'nullable|string|max:10',

        // newly added fields
        'police_station_name' => 'required|string',
        'police_mobile' => 'required|digits:10',
        'station_address' => 'required|string',
    ], [
        'ghaat_name.required' => 'Ghaat name is required.',
        'district_id.required' => 'Please select a district.',
        'river_id.required' => 'Please select a river.',
        'river_id.exists' => 'Selected river is invalid.',
        'road_accessibility.required' => 'Please specify road accessibility.',
        'nearest_hospital.required' => 'Please provide nearest hospital details.',
        'available_facilities.required' => 'Mention at least one facility.',
        'photo_path.image' => 'Uploaded file must be an image.',
        'photo_path.mimes' => 'Photo must be in JPEG or PNG format.',
        'photo_path.max' => 'Photo should not exceed 5MB in size.',

        // validation messages for new fields
        'police_station_name.required' => 'Police station name is required.',
        'police_mobile.required' => 'Police mobile number is required.',
        'police_mobile.digits' => 'Police mobile must be a 10-digit number.',
        'station_address.required' => 'Police station address is required.',
    ]);

    $photoPath = $ghaat->photo_path;

    if ($request->hasFile('photo_path')) {
        if ($ghaat->photo_path && Storage::disk('public')->exists($ghaat->photo_path)) {
            Storage::disk('public')->delete($ghaat->photo_path);
        }

        $image = $request->file('photo_path');
        $photoPath = $image->store('photos', 'public');
    }

    $ghaat->update([
        'photo_path' => $photoPath,
        'latitude' => $request->latitude,
        'longitude' => $request->longitude,
        'pincode' => $request->pincode,
        'location' => $request->location,
        'ghaat_name' => $request->ghaat_name,
        'district_id' => $request->district_id,
        'river_id' => $request->river_id,
        'road_accessibility' => $request->road_accessibility,
        'nearest_hospital' => $request->nearest_hospital,
        'available_facilities' => $request->available_facilities,
        'additional_info' => $request->additional_info,

        // new fields
        'police_station_name' => $request->police_station_name,
        'police_mobile' => $request->police_mobile,
        'station_address' => $request->station_address,
    ]);

    return ApiResponse::generateResponse('success', 'Ghaat updated successfully', $ghaat);
}

}
