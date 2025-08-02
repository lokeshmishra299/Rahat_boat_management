<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Ghaat;
use App\Models\Tehsil;
use App\Models\User;
use App\Models\RegisterBoat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    public function reverseGeocode(Request $request)
    {
        // dd($request->all());
        $lat = $request->query('lat');
        $lon = $request->query('lon');

        if (!$lat || !$lon) {
            return response()->json(['error' => 'Missing lat/lon'], 422);
        }

        $response = Http::withHeaders([
            'User-Agent' => 'GhaatApp/1.0 (lokeshmishra88588@gmail.com)'
        ])->get("https://nominatim.openstreetmap.org/reverse", [
            'lat' => $lat,
            'lon' => $lon,
            'format' => 'json',
        ]);

        return $response->json();
    }

public function boat_ghat()
{
    $boats = RegisterBoat::with('owner')
        ->whereNotNull('boat_latitude')
        ->whereNotNull('boat_longitude')
        ->get();

    $ghats = Ghaat::whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->get();

    return ApiResponse::generateResponse(
        'success',
        'Location fetch successfully',
        [
            'boats' => $boats,
            'ghats' => $ghats
        ]
    );
}

public function tehsil_list()
{
    $user = auth()->user(); 

    $district_id = $user->district_id;

    if ($district_id) {
        $tehsils = Tehsil::where('district_code', $district_id)->get(['tehsil_code', 'tehsil_name']);
    } else {
        $tehsils = Tehsil::all(['tehsil_code', 'tehsil_name']);
    }

    return ApiResponse::generateResponse('success', 'Tehsil list fetched successfully', $tehsils, 200);
}

public function ghat_incharge(){

        $user = auth()->user(); 

    $district_id = $user->district_id;
    // dd($district_id);

    if ($district_id) {
        $ghat_list= User::where('district_id',$district_id)->select('name')->get();
    } else {
        $ghat_list = User::select('name')->get();
    }

    return ApiResponse::generateResponse('success', 'Ghat name fetched successfully', $ghat_list, 200);


}



}

