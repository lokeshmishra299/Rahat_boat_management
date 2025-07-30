<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatOwner;
use App\Models\District;
use App\Models\Ghaat;
use App\Models\RegisterBoat;
use App\Models\Tehsil;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class BoatManagement extends Controller
{
    public function district_list(Request $request)
    {
        // dd("ko");
        $user = auth()->user();
        $excludeAssigned = $request->query('excludeAssigned', false);

        if ($user && $user->role && $user->role->name === 'district_nodal') {
            // For district_nodal, return only their assigned district
            $districts = District::where('district_code', $user->district_code)
                ->select('district_code as id', 'district_name')
                ->orderBy('district_name', 'asc')
                ->get();
        } else {
            $query = District::query();

            if ($excludeAssigned) {
                $assignedDistricts = User::whereNotNull('district_id')
                    ->pluck('district_id')
                    ->toArray();
                // dd($assignedDistricts);

                $query->whereNotIn('district_code', $assignedDistricts);
            }

            $districts = $query->select('district_code as id', 'district_name')
                ->orderBy('district_name', 'asc')
                ->get();
        }

        return ApiResponse::generateResponse('successs', 'District list fetched successfully', $districts);
    }

public function tehsil_list_by_district(Request $request)
{
    $request->validate([
        'district_code' => 'required|integer',
    ]);

    $tehsils = Tehsil::where('district_code', $request->district_code)
                ->select('tehsil_code', 'tehsil_name')  
                ->orderBy('tehsil_name', 'asc')
                ->get();

    return ApiResponse::generateResponse('success', 'Tehsil list fetched successfully', $tehsils);
}





    //   public function store(Request $request, $id) // $id is boat_owner_id
    // {

    //       $boatOwner = BoatOwner::find($id);
    //     if (!$boatOwner) {
    //         return ApiResponse::generateResponse('error', 'Boat Owner not found', [], 404);
    //     }

    //     $validator = Validator::make(
    //         $request->all(),
    //         [
    //             'registration_no'        => 'nullable|unique:register_boats',
    //             'district_id'            => 'required',
    //             'image'                  => 'required|image',
    //             'boat_type'              => 'required',
    //             'pilot_name'             => 'required',
    //             'pilot_license_no'       => 'required',
    //             'support_staff'          => 'required|integer',
    //             'engine_details'         => 'nullable|string',
    //             'passenger_capacity'     => 'required|integer',
    //             'year_of_manufacture'    => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
    //             'ghaat_id'               => 'required',
    //             'registration_authority' => 'required',
    //             'location'               => 'nullable|string',
    //             'remarks'                => 'nullable|string',
    //         ]
    //     );

    //     if ($validator->fails()) {
    //         return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    //     }

    //     $latitude = $request->latitude;
    //     $longitude = $request->longitude;
    //     $pincode = null;
    //     $location = null;


    //     if ($latitude && $longitude) {
    //         try {
    //             $response = Http::withHeaders([
    //                 'User-Agent' => 'BoatApp/1.0 (support@example.com)',
    //             ])->get("https://nominatim.openstreetmap.org/reverse", [
    //                 'lat'    => $latitude,
    //                 'lon'    => $longitude,
    //                 'format' => 'json',
    //             ]);

    //             $data = $response->json();
    //             $address = $data['address'] ?? [];
    //             $pincode = $address['postcode'] ?? null;

    //             $locationParts = [];
    //             if (!empty($address['village']))  $locationParts[] = $address['village'];
    //             if (!empty($address['town']))     $locationParts[] = $address['town'];
    //             if (!empty($address['city']))     $locationParts[] = $address['city'];
    //             if (!empty($address['district'])) $locationParts[] = $address['district'];
    //             if (!empty($address['state']))    $locationParts[] = $address['state'];

    //             $location = implode(', ', array_filter($locationParts));

    //             if (!empty($pincode)) {
    //                 $pinRes = Http::get("https://api.postalpincode.in/pincode/{$pincode}");
    //                 $pinData = $pinRes->json();
    //                 if (
    //                     isset($pinData[0]['Status']) &&
    //                     $pinData[0]['Status'] === 'Success' &&
    //                     isset($pinData[0]['PostOffice'][0])
    //                 ) {
    //                     $office = $pinData[0]['PostOffice'][0];
    //                     $location = "{$office['Name']}, {$office['District']}";
    //                 }
    //             }
    //         } catch (\Exception $e) {

    //         }
    //     }

    //     $imagePath = $request->file('image')->store('boats', 'public');

    //     $boat = RegisterBoat::create([
    //         'registration_no'        => $request->registration_no,
    //         'district_id'            => $request->district_id,
    //         'image'                  => $imagePath,
    //         'latitude'               => $latitude,
    //         'longitude'              => $longitude,
    //         'pincode'                => $pincode,
    //         'location'               => $location ?? $request->location,
    //         'boat_type'              => $request->boat_type,
    //         'pilot_name'             => $request->pilot_name,
    //         'pilot_license_no'       => $request->pilot_license_no,
    //         'support_staff'          => $request->support_staff,
    //         'engine_details'         => $request->engine_details,
    //         'passenger_capacity'     => $request->passenger_capacity,
    //         'year_of_manufacture'    => $request->year_of_manufacture,
    //         'ghaat_id'               => $request->ghaat_id,
    //         'registration_authority' => $request->registration_authority,
    //         'remarks'                => $request->remarks,
    //         'boat_owner_id'          => $id, 
    //     ]);

    //     return ApiResponse::generateResponse('success', 'Boat registered successfully.', $boat);
    // }


public function store(Request $request, $id) 
{
    $boatOwner = BoatOwner::find($id);
    if (!$boatOwner) {
        return ApiResponse::generateResponse('error', 'Boat Owner not found', [], 404);
    }

    $validator = Validator::make($request->all(), [
        'registration_no'        => 'nullable|unique:register_boats',
        'district_id'            => 'required',
        'boat_image'             => 'required|image|mimes:jpeg,png,jpg|max:5120',
        'pilot_image'            => 'required|image|mimes:jpeg,png,jpg|max:5120',
        'boat_type'              => 'required',
        'pilot_name'             => 'required',
        'pilot_license_no'      => 'required',
        'support_staff'          => 'required|integer',
        'engine_details'        => 'nullable|string',
        'passenger_capacity'    => 'required|integer',
        'year_of_manufacture'   => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
        'ghaat_id'              => 'required',
        'registration_authority' => 'required',
        'boat_location'          => 'nullable|string',
        'pilot_location'         => 'nullable|string',
        'remarks'                => 'nullable|string',
        'adhar_no'               => 'required|string|max:12',
        'contact_no'             => 'required|string|max:20',
        
        // Add validation for new geolocation fields
        'boat_latitude'          => 'nullable|numeric',
        'boat_longitude'         => 'nullable|numeric',
        'boat_pincode'          => 'nullable|string',
        'pilot_latitude'         => 'nullable|numeric',
        'pilot_longitude'        => 'nullable|numeric',
        'pilot_pincode'          => 'nullable|string',
        
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

    // Upload boat image
    if ($request->hasFile('boat_image')) {
        $boatImagePath = $request->file('boat_image')->store('boats', 'public');
    }

    // Upload pilot image
    if ($request->hasFile('pilot_image')) {
        $pilotImagePath = $request->file('pilot_image')->store('pilots', 'public'); 
    }

    // Fetch Ghaat & District Info
    $ghaat = Ghaat::with('district_record')->findOrFail($request->ghaat_id);
    $districtNameShort = strtoupper(substr($ghaat->district_record->district_name ?? 'XXX', 0, 3));
    $ghaatUid = $ghaat->ghat_uid ?? 'GH-000-0000';

    // Create the boat record with separate geolocation data
    $boat = RegisterBoat::create([
        'registration_no'        => $request->registration_no,
        'district_id'            => $request->district_id,
        'boat_image'             => 'storage/' . $boatImagePath,  
        'pilot_image'            => 'storage/' . $pilotImagePath,
        // Boat geolocation data
        'boat_latitude'          => $request->boat_latitude,
        'boat_longitude'         => $request->boat_longitude,
        'boat_pincode'           => $request->boat_pincode,
        'boat_location'          => $request->boat_location,
        // Pilot geolocation data
        'pilot_latitude'         => $request->pilot_latitude,
        'pilot_longitude'        => $request->pilot_longitude,
        'pilot_pincode'          => $request->pilot_pincode,
        'pilot_location'         => $request->pilot_location,
        // Other boat details
        'boat_type'              => $request->boat_type,
        'pilot_name'             => $request->pilot_name,
        'pilot_license_no'      => $request->pilot_license_no,
        'support_staff'          => $request->support_staff,
        'engine_details'        => $request->engine_details,
        'passenger_capacity'    => $request->passenger_capacity,
        'year_of_manufacture'   => $request->year_of_manufacture,
        'ghaat_id'              => $request->ghaat_id,
        'registration_authority' => $request->registration_authority,
        'remarks'               => $request->remarks,
        'boat_owner_id'         => $id,
        'pilot_adhar'           => $request->adhar_no,
        'pilot_contact'         => $request->contact_no,
        'user_id' => auth()->id(),
    ]);

    $boatId = str_pad($boat->id, 3, '0', STR_PAD_LEFT);
    $boat_uid = "UP-$districtNameShort-$ghaatUid-$boatId";

    $boat->update([
        'boat_uid' => $boat_uid
    ]);

    return ApiResponse::generateResponse('success', 'Boat registered successfully.', $boat);
}



    public function index()
    {
        $boats = RegisterBoat::with(['district', 'ghaat'])
            ->orderBy('id', 'desc')
            ->get();

        return ApiResponse::generateResponse('success', 'Boat list fetched successfully.', $boats);
    }


    public function  total_list()
    {

        $boats = RegisterBoat::with(['district', 'ghaat'])
            ->orderBy('id', 'desc')
            ->get();

        return ApiResponse::generateResponse('success', 'Boat list fetched successfully.', $boats);
    }

    public function view_list(Request $request, $id)
    {
        $boat = RegisterBoat::with([
            'district:district_code,district_name',
            'ghaat:id,ghaat_name'
        ])
            ->where('id', $id)
            ->first();

        if (!$boat) {
            return ApiResponse::generateResponse('error', 'Boat not found.', [], 404);
        }

        return ApiResponse::generateResponse('success', 'Boat data fetched successfully.', $boat);
    }


   public function edit(Request $request, $id)
{
    $boat = RegisterBoat::find($id);

    if (!$boat) {
        return ApiResponse::generateResponse('error', 'Boat not found', [], 404);
    }

    $validator = Validator::make($request->all(), [
        'registration_no'        => 'nullable|unique:register_boats,registration_no,' . $id,
        'district_id'            => 'required',
        'boat_image'             => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        'pilot_image'            => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        'boat_type'              => 'required|string',
        'pilot_name'             => 'required|string',
        'pilot_license_no'       => 'required|string',
        'support_staff'          => 'required|integer',
        'engine_details'         => 'nullable|string',
        'passenger_capacity'     => 'required|integer',
        'year_of_manufacture'    => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
        'ghaat_id'              => 'required|exists:ghaats,id',
        'registration_authority' => 'required|string',
        'remarks'               => 'nullable|string',
        'pilot_adhar'              => 'nullable|string|max:12',
        'pilot_contact'            => 'nullable|string|max:20',
        'boat_latitude'         => 'nullable|numeric',
        'boat_longitude'        => 'nullable|numeric',
        'boat_pincode'          => 'nullable|string|max:10',
        'boat_location'         => 'nullable|string',
        'pilot_latitude'        => 'nullable|numeric',
        'pilot_longitude'       => 'nullable|numeric',
        'pilot_pincode'         => 'nullable|string|max:10',
        'pilot_location'        => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

    // Only update boat image if a new file uploaded
    if ($request->hasFile('boat_image')) {
        $boatImagePath = $request->file('boat_image')->store('boats', 'public');
        $boat->boat_image = 'storage/' . $boatImagePath;
    }
    // else keep old boat_image unchanged

    // Only update pilot image if a new file uploaded
    if ($request->hasFile('pilot_image')) {
        $pilotImagePath = $request->file('pilot_image')->store('pilots', 'public');
        $boat->pilot_image = 'storage/' . $pilotImagePath;
    }
    // else keep old pilot_image unchanged

    // Update other fields
    $boat->fill($request->only([
        'registration_no',
        'district_id',
        'boat_type',
        'pilot_name',
        'pilot_license_no',
        'support_staff',
        'engine_details',
        'passenger_capacity',
        'year_of_manufacture',
        'ghaat_id',
        'registration_authority',
        'remarks',
        'boat_latitude',
        'boat_longitude',
        'boat_pincode',
        'boat_location',
        'pilot_latitude',
        'pilot_longitude',
        'pilot_pincode',
        'pilot_location',
    ]));

    
    $boat->pilot_adhar = $request->pilot_adhar;
    $boat->pilot_contact = $request->pilot_contact;

  
    if (
        $request->ghaat_id != $boat->getOriginal('ghaat_id') ||
        $request->district_id != $boat->getOriginal('district_id')
    ) {
        $ghaat = Ghaat::with('district_record')->find($request->ghaat_id);

        if ($ghaat && $ghaat->district_record) {
            $districtNameShort = strtoupper(substr($ghaat->district_record->district_name, 0, 3));
            $ghaatUid = $ghaat->ghat_uid ?? 'GH-000-0000';
            $boatId = str_pad($boat->id, 3, '0', STR_PAD_LEFT);

            $boat->boat_uid = "UP-$districtNameShort-$ghaatUid-$boatId";
        }
    }

    $boat->save();

    return ApiResponse::generateResponse('success', 'Boat details updated successfully.', $boat);
}

public function boatsByGhaat(Request $request)
{
    $request->validate([
        'ghaat_id' => 'required|integer|exists:ghaats,id',
    ]);

    $boats = RegisterBoat::where('ghaat_id', $request->ghaat_id)
        ->select('id', 'boat_uid','passenger_capacity')
        ->get();

    return ApiResponse::generateResponse(
        'success',
        'Boats fetched successfully.',
        $boats,
        200
    );

}
}
