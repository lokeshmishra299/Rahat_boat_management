<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\RegisterBoat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class BoatManagement extends Controller
{
    public function district_list(Request $request)
    {
        $user = auth()->user();
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
                'engine_details'         => 'nullable|string',
                'passenger_capacity'     => 'required|integer',
                'year_of_manufacture'    => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
                'ghaat_id'               => 'required',
                'registration_authority' => 'required',
                'location'               => 'nullable|string',

                'owner_name'             => 'required|string|max:255',
                'owner_email'            => 'required|email',
                'owner_number'           => 'required|digits:10',
                'owner_adhar_no'         => 'nullable|digits:12',
                'owner_boat_owned'       => 'nullable|string|max:255',
                'owner_address'          => 'nullable|string',
                'owner_pincode'          => 'nullable|string|max:10',
                'owner_family_name'      => 'nullable|string|max:100',
                'owner_relation'         => 'nullable|string|max:100',
                'owner_dob'              => 'nullable|date',
            ],
            [
                'registration_no.required' => 'Registration number is required.',
                'registration_no.unique'   => 'This registration number already exists.',
                'district_id.required'     => 'Please select a district.',
                'district_id.exists'       => 'Selected district is invalid.',
                'image.required'           => 'Boat image is required.',
                'image.image'              => 'The uploaded file must be an image.',
                'boat_type.required'       => 'Boat type is required.',
                'pilot_name.required'      => 'Pilot name is required.',
                'pilot_license_no.required' => 'Pilot license number is required.',
                'support_staff.required'   => 'Number of support staff is required.',
                'support_staff.integer'    => 'Support staff must be a number.',
                'passenger_capacity.required' => 'Passenger capacity is required.',
                'passenger_capacity.integer'  => 'Passenger capacity must be a number.',
                'year_of_manufacture.digits'  => 'Year of manufacture must be 4 digits.',
                'ghaat_id.required'        => 'Please select a ghat.',
                'registration_authority.required' => 'Registration authority is required.',
                'owner_name.required'      => 'Owner name is required.',
                'owner_email.email'        => 'Owner email must be valid.',
                'owner_number.required'    => 'Owner contact number is required.',
                'owner_number.digits'      => 'Owner contact number must be 10 digits.',
                'owner_adhar_no.digits'    => 'Aadhar number must be 12 digits.',
                'owner_dob.date'           => 'Owner DOB must be a valid date.',
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

                $pincode = $address['postcode'] ?? $request->owner_pincode;

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
                $pincode = $request->owner_pincode;
                $location = $request->location;
            }
        }

        $pincode = $pincode ?? $request->owner_pincode;
        $location = $location ?? $request->location;

        $imagePath = $request->file('image')->store('boats', 'public');

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

            'owner_name'             => $request->owner_name,
            'owner_email'            => $request->owner_email,
            'owner_number'           => $request->owner_number,
            'owner_adhar_no'         => $request->owner_adhar_no,
            'owner_boat_owned'       => $request->owner_boat_owned,
            'owner_address'          => $request->owner_address,
            'owner_pincode'          => $pincode,
            'owner_family_name' => is_array($request->owner_family_name)
                ? implode(',', $request->owner_family_name)
                : $request->owner_family_name,

            'owner_relation'         => $request->owner_relation,
            'owner_dob'              => $request->owner_dob,
        ]);

        return ApiResponse::generateResponse('success', 'Boat registered successfully.', $boat);
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
            'district_id'            => 'required|exists:districts,id',
            'image'                  => 'nullable|image',
            'boat_type'              => 'required',
            'pilot_name'             => 'required',
            'pilot_license_no'       => 'required',
            'support_staff'          => 'required|integer',
            // 'engine_details'         => 'required',
            'passenger_capacity'     => 'required|integer',
            'year_of_manufacture'    => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
            'ghaat_id'               => 'required',
            'registration_authority' => 'required',
            'location'               => 'nullable|string',
            'latitude'               => 'nullable|numeric',
            'longitude'              => 'nullable|numeric',
            'pincode'                => 'nullable|string|max:10',

            'owner_name'             => 'required|string|max:255',
            'owner_email'            => 'nullable|email',
            'owner_number'           => 'required|digits:10',
            'owner_adhar_no'         => 'nullable|digits:12',
            'owner_boat_owned'       => 'nullable|string|max:255',
            'owner_address'          => 'nullable|string',
            'owner_pincode'          => 'nullable|string|max:10',
            'owner_family_name'      => 'nullable',
            'owner_relation'         => 'nullable',
            'owner_dob'              => 'nullable',
        ]
    );

    if ($validator->fails()) {
        return ApiResponse::generateResponse('error', 'Validation failed.', $validator->errors(), 422);
    }

    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')->store('boats', 'public');
        $boat->image = $imagePath;
    }

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

        'owner_name',
        'owner_email',
        'owner_number',
        'owner_adhar_no',
        'owner_boat_owned',
        'owner_address',
        'owner_pincode',
    ]));

    $boat->owner_family_name = $owner_family_name;
    $boat->owner_dob = $owner_dob;

    $boat->save();

    return ApiResponse::generateResponse('success', 'Boat details updated successfully.', $boat);
}

}
