<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
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
        // dd($request->all());
        $request->validate([
            'photo_path' => 'required|image|mimes:jpeg,jpg,png|max:5120',
            'ghaat_name' => 'required|string',
            'district_id' => 'required|string',
            'river_id' => 'required|exists:rivers,id',
            'boat_capacity' => 'required|integer',
            'road_accessibility' => 'required|string',
            'contact_person' => 'required|string',
            'contact_number' => 'required|string',
            'nearest_hospital' => 'required|string',
            'available_facilities' => 'required|string',
            'additional_info' => 'nullable|string',
            'location' => 'nullable|string',
        ], [
            'photo_path.required' => 'Please upload a photo.',
            'photo_path.image' => 'Uploaded file must be an image.',
            'photo_path.mimes' => 'Photo must be a JPEG or PNG file.',
            'photo_path.max' => 'Photo size should not exceed 5MB.',

            'ghaat_name.required' => 'Ghaat name is required.',
            'district_id.required' => 'Please select a district.',
            'river_id.required' => 'Please select a river.',
            'river_id.exists' => 'Selected river is invalid.',
            'boat_capacity.required' => 'Boat capacity is required.',
            'boat_capacity.integer' => 'Boat capacity must be a number.',

            'road_accessibility.required' => 'Please select road accessibility.',
            'contact_person.required' => 'Contact person name is required.',
            'contact_number.required' => 'Contact number is required.',
            'nearest_hospital.required' => 'Please provide nearest hospital details.',
            'available_facilities.required' => 'Mention at least one facility.',
        ]);

        $image = $request->file('photo_path');
        $photoPath = $image->store('photos', 'public');

        // $exif = @exif_read_data($image->getRealPath());

        // $latitude = null;
        // $longitude = null;

        // if ($exif && isset($exif['GPSLatitude'], $exif['GPSLongitude'])) {
        //     $latitude = $this->getGps($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
        //     $longitude = $this->getGps($exif['GPSLongitude'], $exif['GPSLongitudeRef']);
        // }

        $ghaat = Ghaat::create([
            'photo_path' => $photoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'pincode' => $request->pincode,
            'location' => $request->location,
            'ghaat_name' => $request->ghaat_name,
            'district_id' => $request->district_id,
            'river_id' => $request->river_id,
            'boat_capacity' => $request->boat_capacity,
            'road_accessibility' => $request->road_accessibility,
            'contact_person' => $request->contact_person,
            'contact_number' => $request->contact_number,
            'nearest_hospital' => $request->nearest_hospital,
            'available_facilities' => $request->available_facilities,
            'additional_info' => $request->additional_info,
        ]);

        return ApiResponse::generateResponse(
            'success',
            'Ghaat registered successfully',
            $ghaat,
            201
        );
    }

    /*
    private function getGps($exifCoord, $hemi)
    {
        $degrees = $this->gps2Num($exifCoord[0]);
        $minutes = $this->gps2Num($exifCoord[1]);
        $seconds = $this->gps2Num($exifCoord[2]);

        $flip = ($hemi == 'S' || $hemi == 'W') ? -1 : 1;

        return $flip * ($degrees + ($minutes / 60) + ($seconds / 3600));
    }

    private function gps2Num($coordPart)
    {
        $parts = explode('/', $coordPart);
        if (count($parts) == 1) return floatval($parts[0]);
        return floatval($parts[0]) / floatval($parts[1]);
    } 
    */

    public function index()
    {

        $ghats = Ghaat::with('river_record', 'district_record')
            ->withCount('registeredBoats')
            ->orderBy('id','desc')
            ->get();


        // dd($ghats->toArray());

        return ApiResponse::generateResponse(
            'success',
            'Ghaat list fetch successfully',
            $ghats,
            201
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
            'ghaat_name' => 'required|string',
            'district_id' => 'required|string',
            'river_id' => 'required|exists:rivers,id',
            'boat_capacity' => 'required|integer',
            'road_accessibility' => 'required|string',
            'contact_person' => 'required|string',
            'contact_number' => 'required|string',
            'nearest_hospital' => 'required|string',
            'available_facilities' => 'required|string',
            'additional_info' => 'nullable|string',
            'photo_path' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        ], [
            'ghaat_name.required' => 'Ghaat name is required.',
            'district_id.required' => 'Please select a district.',
            'river_id.required' => 'Please select a river.',
            'river_id.exists' => 'Selected river is invalid.',
            'boat_capacity.required' => 'Boat capacity is required.',
            'boat_capacity.integer' => 'Boat capacity must be a number.',
            'road_accessibility.required' => 'Please specify road accessibility.',
            'contact_person.required' => 'Contact person name is required.',
            'contact_number.required' => 'Contact number is required.',
            'nearest_hospital.required' => 'Please provide nearest hospital details.',
            'available_facilities.required' => 'Mention at least one facility.',
            'photo_path.image' => 'Uploaded file must be an image.',
            'photo_path.mimes' => 'Photo must be in JPEG or PNG format.',
            'photo_path.max' => 'Photo should not exceed 5MB in size.',
        ]);

        $photoPath = $ghaat->photo_path;
        $latitude = $ghaat->latitude;
        $longitude = $ghaat->longitude;

        if ($request->hasFile('photo_path')) {
            if ($ghaat->photo_path && Storage::disk('public')->exists($ghaat->photo_path)) {
                Storage::disk('public')->delete($ghaat->photo_path);
            }

            $image = $request->file('photo_path');
            $photoPath = $image->store('photos', 'public');

            $exif = @exif_read_data($image->getRealPath());

            if ($exif && isset($exif['GPSLatitude'], $exif['GPSLongitude'])) {
                $latitude = $this->getGps($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
                $longitude = $this->getGps($exif['GPSLongitude'], $exif['GPSLongitudeRef']);
            }
        }

        $ghaat->update([
            'photo_path' => $photoPath,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'ghaat_name' => $request->ghaat_name,
            'district_id' => $request->district_id,
            'river_id' => $request->river_id,
            'boat_capacity' => $request->boat_capacity,
            'road_accessibility' => $request->road_accessibility,
            'contact_person' => $request->contact_person,
            'contact_number' => $request->contact_number,
            'nearest_hospital' => $request->nearest_hospital,
            'available_facilities' => $request->available_facilities,
            'additional_info' => $request->additional_info,
        ]);

        return ApiResponse::generateResponse('success', 'Ghaat updated successfully', $ghaat);
    }
}
