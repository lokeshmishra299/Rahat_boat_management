<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\RegisterBoat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exif\Reader;
use Illuminate\Support\Facades\Http;

class BoatManagement extends Controller
{
    public function district_list(Request $request)
{
    $user = auth()->user();
    // dd($user);
    if ($user && $user->role && $user->role->name === 'district_nodal') {
        $districts = District::where('id', $user->district_id)
            ->select('id', 'district_name')
            ->orderBy('district_name', 'asc')
            ->get();
    } else {
        $districts = District::select('id', 'district_name')
            ->orderBy('district_name', 'asc')
            ->get();
    }

    return ApiResponse::generateResponse('success', 'District list fetched successfully', $districts);
}


   /* public function store(Request $request)
    {
        // dd($request->all());
        $validator = Validator::make(
            $request->all(),
            [
                'registration_no'       => 'required|unique:register_boats',
                'district_id'           => 'required|exists:districts,id',
                'image'                 => 'required|image',
                'boat_type'             => 'required',
                'pilot_name'            => 'required',
                'pilot_license_no'      => 'required',
                'support_staff'         => 'required|integer',
                'engine_details'        => 'required',
                'passenger_capacity'    => 'required|integer',
                'year_of_manufacture' => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
                'ghaat_id'         => 'required',
                'registration_authority' => 'required',
                'location' => 'nullable|string',

            ],
            [
                'registration_no.required' => 'Registration number is required.',
                'registration_no.unique'   => 'This registration number already exists.',
                'district_id.required' => 'Please select a district.',
                'district_id.exists' => 'Selected district is invalid.',
                'image.required'           => 'Please upload a boat image.',
                'image.image'              => 'The uploaded file must be an image.',
                'boat_type.required'       => 'Please specify the boat type.',
                'pilot_name.required'      => 'Pilot name is required.',
                'pilot_license_no.required' => 'Pilot license number is required.',
                'support_staff.required'   => 'Please specify number of support staff.',
                'support_staff.integer'    => 'Support staff must be a valid number.',
                'engine_details.required'  => 'Engine details are required.',
                'passenger_capacity.required' => 'Please specify passenger capacity.',
                'passenger_capacity.integer'  => 'Passenger capacity must be a number.',
                // 'year_of_manufacture.required' => 'Year of manufacture is required.',
                // 'year_of_manufacture.year'     => 'Invalid date format for year of manufacture.',
                'ghaat_id.required'       => 'Please enter assigned ghat.',
                'registration_authority.required' => 'Registration authority is required.',
            ]
        );


        if ($validator->fails()) {
            return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
        }

        $imagePath = $request->file('image')->store('boats', 'public');

        $boat = RegisterBoat::create([
            'registration_no'        => $request->registration_no,
            'district_id'            => $request->district_id,
            'image'                  => $imagePath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'pincode' => $request->pincode,
            'location' => $request->location,
            'boat_type'              => $request->boat_type,
            'pilot_name'             => $request->pilot_name,
            'pilot_license_no'       => $request->pilot_license_no,
            'support_staff'          => $request->support_staff,
            'engine_details'         => $request->engine_details,
            'passenger_capacity'     => $request->passenger_capacity,
            'year_of_manufacture'    => $request->year_of_manufacture,
            'ghaat_id'          => $request->ghaat_id,
            'registration_authority' => $request->registration_authority,
            'remarks'                => $request->remarks,
        ]);

        return ApiResponse::generateResponse('success', 'Boat registered successfully.', $boat);
    }
        */



public function store(Request $request)
{
    $validator = Validator::make(
        $request->all(),
        [
            'registration_no'        => 'required|unique:register_boats',
            'district_id'            => 'required|exists:districts,id',
            'image'                  => 'required|image',
            'boat_type'              => 'required',
            'pilot_name'             => 'required',
            'pilot_license_no'       => 'required',
            'support_staff'          => 'required|integer',
            'engine_details'         => 'required',
            'passenger_capacity'     => 'required|integer',
            'year_of_manufacture'    => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
            'ghaat_id'               => 'required',
            'registration_authority' => 'required',
            'location'               => 'nullable|string',
        ]
    );

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

   $image = $request->file('image');
$exif = @exif_read_data($image->getPathname());

$latitude = null;
$longitude = null;

if (isset($exif['GPSLatitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitude'], $exif['GPSLongitudeRef'])) {
    $latitude = $this->getGps($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
    $longitude = $this->getGps($exif['GPSLongitude'], $exif['GPSLongitudeRef']);
}

// Fallback to frontend values
$latitude = $latitude ?? $request->latitude;
$longitude = $longitude ?? $request->longitude;

$pincode = null;
$location = null;

if ($latitude && $longitude) {
    try {
        $response = Http::withHeaders([
            'User-Agent' => 'BoatApp/1.0 (support@example.com)',
        ])->get("https://nominatim.openstreetmap.org/reverse", [
            'lat' => $latitude,
            'lon' => $longitude,
            'format' => 'json',
        ]);

        $data = $response->json();
        $address = $data['address'] ?? [];

        $pincode = $address['postcode'] ?? $request->pincode;

        // Build location from available fields
        $locationParts = [];
        if (!empty($address['village'])) $locationParts[] = $address['village'];
        if (!empty($address['town'])) $locationParts[] = $address['town'];
        if (!empty($address['city'])) $locationParts[] = $address['city'];
        if (!empty($address['district'])) $locationParts[] = $address['district'];
        if (!empty($address['state'])) $locationParts[] = $address['state'];

        $location = implode(', ', array_filter($locationParts));

        // ⬇️ More accurate Indian location from pincode
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
        $pincode = $request->pincode;
        $location = $request->location;
    }
}

// Final fallback
$pincode = $pincode ?? $request->pincode;
$location = $location ?? $request->location;

// Save image
$imagePath = $image->store('boats', 'public');

// // Debug
// dd([
//     'Latitude' => $latitude,
//     'Longitude' => $longitude,
//     'Pincode' => $pincode,
//     'Location' => $location,
// ]);



  
    $boat = RegisterBoat::create([
        'registration_no'        => $request->registration_no,
        'district_id'            => $request->district_id,
        'image'                  => $imagePath,
        'latitude'               => $latitude,
        'longitude'              => $longitude,
        'pincode'                => $pincode,
        'location'               => $location,
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
    ]);

    return ApiResponse::generateResponse('success', 'Boat registered successfully.', $boat);
}




private function getGps($exifCoord, $hemi)
{
    $degrees = $this->gps2Num($exifCoord[0]);
    $minutes = $this->gps2Num($exifCoord[1]);
    $seconds = $this->gps2Num($exifCoord[2]);

    $flip = ($hemi == 'W' || $hemi == 'S') ? -1 : 1;

    return $flip * ($degrees + ($minutes / 60) + ($seconds / 3600));
}

private function gps2Num($coordPart)
{
    $parts = explode('/', $coordPart);
    if (count($parts) <= 0) return 0;
    if (count($parts) == 1) return $parts[0];
    return floatval($parts[0]) / floatval($parts[1]);
}


    public function index()
    {
        $boats = RegisterBoat::with(['district', 'ghaat'])->get();

        return ApiResponse::generateResponse('success', 'Boat list fetched successfully.', $boats);
    }



    public function view_list(Request $request, $id)
    {
        $boat = RegisterBoat::with(['district:id,district_name', 'ghaat:id,ghaat_name'])
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

        $validator = Validator::make(
            $request->all(),
            [
                'district_id'           => 'required|exists:districts,id',
                'image'                 => 'nullable|image',
                'boat_type'             => 'required',
                'pilot_name'            => 'required',
                'pilot_license_no'      => 'required',
                'support_staff'         => 'required|integer',
                'engine_details'        => 'required',
                'passenger_capacity'    => 'required|integer',
                'year_of_manufacture'   => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
                'ghaat_id'              => 'required',
                'registration_authority' => 'required',
                'location' => 'nullable|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'pincode' => 'nullable|string|max:10',
            ]
        );

        if ($validator->fails()) {
            return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('boats', 'public');
            $boat->image = $imagePath;
        }

        $boat->fill($request->only([
            'district_id',
            'boat_type',
            'pilot_name',
            'latitude',
            'longitude',
            'pincode',
            'location',
            'pilot_license_no',
            'support_staff',
            'engine_details',
            'passenger_capacity',
            'year_of_manufacture',
            'ghaat_id',
            'registration_authority',
            'remarks'
        ]));

        $boat->save();

        return ApiResponse::generateResponse('success', 'Boat details updated successfully.', $boat);
    }
}
