<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatOwner;
use App\Models\District;
use App\Models\Ghaat;
use App\Models\RegisterBoat;
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

        return ApiResponse::generateResponse('success', 'District list fetched successfully', $districts);
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
        'pilot_license_no'       => 'required',
        'support_staff'          => 'required|integer',
        'engine_details'         => 'nullable|string',
        'passenger_capacity'     => 'required|integer',
        'year_of_manufacture'    => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
        'ghaat_id'               => 'required',
        'registration_authority' => 'required',
        'location'               => 'nullable|string',
        'remarks'                => 'nullable|string',
        'adhar_no'               => 'required|string|max:12',
        'contact_no'             => 'required|string|max:20',
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

    // Step 1: First create the boat record (without boat_uid)
    $boat = RegisterBoat::create([
        'registration_no'        => $request->registration_no,
        'district_id'            => $request->district_id,
        'boat_image'             => 'storage/' . $boatImagePath,  
        'pilot_image'            => 'storage/' . $pilotImagePath, 
        'latitude'               => $request->latitude,
        'longitude'              => $request->longitude,
        'pincode'                => $request->pincode,
        'location'               => $request->location,
        'boat_type'              => $request->boat_type,
        'pilot_name'             => $request->pilot_name,
        'pilot_license_no'       => $request->pilot_license_no,
        'support_staff'          => $request->support_staff,
        'engine_details'         => $request->engine_details,
        'passenger_capacity'     => $request->passenger_capacity,
        'year_of_manufacture'    => $request->year_of_manufacture,
        'ghaat_id'               => $request->ghaat_id,
        'registration_authority' => $request->registration_authority,
        'remarks'                => $request->remarks,
        'boat_owner_id'          => $id,
        'pilot_adhar'            => $request->adhar_no,
        'pilot_contact'          => $request->contact_no,
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
        'ghaat_id'               => 'required|exists:ghaats,id',
        'registration_authority' => 'required|string',
        'location'               => 'nullable|string',
        'latitude'               => 'nullable|numeric',
        'longitude'              => 'nullable|numeric',
        'pincode'                => 'nullable|string|max:10',
        'remarks'                => 'nullable|string',
        'adhar_no'               => 'nullable|string|max:12',
        'contact_no'             => 'nullable|string|max:20',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

    // Upload boat image
    if ($request->hasFile('boat_image')) {
        $boatImagePath = $request->file('boat_image')->store('boats', 'public');
        $boat->boat_image = 'storage/' . $boatImagePath;
    }

    // Upload pilot image
    if ($request->hasFile('pilot_image')) {
        $pilotImagePath = $request->file('pilot_image')->store('pilots', 'public');
        $boat->pilot_image = 'storage/' . $pilotImagePath;
    }

    // Fill basic fields
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
        'location',
        'latitude',
        'longitude',
        'pincode',
        'remarks',
    ]));

    // Map manual fields
    $boat->pilot_adhar = $request->adhar_no;
    $boat->pilot_contact = $request->contact_no;

    // Regenerate UID only if ghat or district changed
    if (
        $request->ghaat_id != $boat->getOriginal('ghaat_id') ||
        $request->district_id != $boat->getOriginal('district_id')
    ) {
        $ghaat = Ghaat::with('district_record')->find($request->ghaat_id);

        if ($ghaat && $ghaat->district_record) {
            $districtNameShort = strtoupper(substr($ghaat->district_record->district_name, 0, 3)); // e.g. BAH
            $ghaatUid = $ghaat->ghat_uid ?? 'GH-000-0000'; // e.g. GH-180-0003
            $boatId = str_pad($boat->id, 3, '0', STR_PAD_LEFT); // e.g. 021

            $boat->boat_uid = "UP-$districtNameShort-$ghaatUid-$boatId";
        }
    }

    $boat->save();

    return ApiResponse::generateResponse('success', 'Boat details updated successfully.', $boat);
}

}
