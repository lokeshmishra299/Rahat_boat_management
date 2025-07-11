<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatOwner;
use App\Models\District;
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





  public function store(Request $request, $id) // $id is boat_owner_id
{

      $boatOwner = BoatOwner::find($id);
    if (!$boatOwner) {
        return ApiResponse::generateResponse('error', 'Boat Owner not found', [], 404);
    }

    $validator = Validator::make(
        $request->all(),
        [
            'registration_no'        => 'nullable|unique:register_boats',
            'district_id'            => 'required',
            'image'                  => 'required|image',
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
        ]
    );

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

    $latitude = $request->latitude;
    $longitude = $request->longitude;
    $pincode = null;
    $location = null;

    
    if ($latitude && $longitude) {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'BoatApp/1.0 (support@example.com)',
            ])->get("https://nominatim.openstreetmap.org/reverse", [
                'lat'    => $latitude,
                'lon'    => $longitude,
                'format' => 'json',
            ]);

            $data = $response->json();
            $address = $data['address'] ?? [];
            $pincode = $address['postcode'] ?? null;

            $locationParts = [];
            if (!empty($address['village']))  $locationParts[] = $address['village'];
            if (!empty($address['town']))     $locationParts[] = $address['town'];
            if (!empty($address['city']))     $locationParts[] = $address['city'];
            if (!empty($address['district'])) $locationParts[] = $address['district'];
            if (!empty($address['state']))    $locationParts[] = $address['state'];

            $location = implode(', ', array_filter($locationParts));

            if (!empty($pincode)) {
                $pinRes = Http::get("https://api.postalpincode.in/pincode/{$pincode}");
                $pinData = $pinRes->json();
                if (
                    isset($pinData[0]['Status']) &&
                    $pinData[0]['Status'] === 'Success' &&
                    isset($pinData[0]['PostOffice'][0])
                ) {
                    $office = $pinData[0]['PostOffice'][0];
                    $location = "{$office['Name']}, {$office['District']}";
                }
            }
        } catch (\Exception $e) {
          
        }
    }

    $imagePath = $request->file('image')->store('boats', 'public');

    $boat = RegisterBoat::create([
        'registration_no'        => $request->registration_no,
        'district_id'            => $request->district_id,
        'image'                  => $imagePath,
        'latitude'               => $latitude,
        'longitude'              => $longitude,
        'pincode'                => $pincode,
        'location'               => $location ?? $request->location,
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
    ]);

    return ApiResponse::generateResponse('success', 'Boat registered successfully.', $boat);
}


    public function index()
    {
        $boats = RegisterBoat::with(['district', 'ghaat'])
        ->orderBy('id','desc')
        ->get();

        return ApiResponse::generateResponse('success', 'Boat list fetched successfully.', $boats);
    }


    public function  total_list(){

         $boats = RegisterBoat::with(['district', 'ghaat'])
        ->orderBy('id','desc')
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
        'district_id'            => 'required',
        'image'                  => 'nullable|image',
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

        // Boat owner details
        'owner_name'             => 'nullable|string|max:255',
        'owner_email'            => 'nullable|email',
        'owner_number'           => 'nullable|digits:10',
        'owner_adhar_no'         => 'nullable|digits:12',
        'owner_boat_owned'       => 'nullable|string|max:255',
        'owner_pincode'          => 'nullable|string|max:10',
        'owner_family_name'      => 'nullable',
        'owner_dob'              => 'nullable',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')->store('boats', 'public');
        $boat->image = $imagePath;
    }

    // Handle array to string conversion
    $owner_family_name = is_array($request->owner_family_name)
        ? implode(',', $request->owner_family_name)
        : $request->owner_family_name;

    $owner_dob = is_array($request->owner_dob)
        ? implode(',', $request->owner_dob)
        : $request->owner_dob;

    $boat->fill($request->only([
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
        'registration_no',

        'owner_name',
        'owner_email',
        'owner_number',
        'owner_adhar_no',
        'owner_boat_owned',
        'owner_pincode',
    ]));

    $boat->owner_family_name = $owner_family_name;
    $boat->owner_dob = $owner_dob;

    $boat->save();

    return ApiResponse::generateResponse('success', 'Boat details updated successfully.', $boat);
}


}
