<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Ghaat;
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
    $boats = RegisterBoat::with('owner')->get();
    $ghats = Ghaat::get();

    return ApiResponse::generateResponse(
        'success',
        'Location fetch successfully',
        [
            'boats' => $boats,
            'ghats' => $ghats
        ]
    );
}

}

