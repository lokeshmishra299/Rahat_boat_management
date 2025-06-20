<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Ghaat;
use App\Models\RegisterBoat;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DistrictController extends Controller
{
    public function index()
    {

        $districtWithGhaats = Ghaat::distinct('district_id')->count('district_id');
        $total_district=District::count();
        $ghaatCount = Ghaat::count();
        // dd($ghaatCount);
        $boatCount = RegisterBoat::count();
        // dd($boatCount);

        $data = [
            'total_districts_with_ghaats' => $districtWithGhaats,
            'total_district'=>$total_district,
            'total_ghaats' => $ghaatCount,
            'total_registered_boats' => $boatCount,
        ];

        return ApiResponse::generateResponse(
            'success',
            'Counts fetched successfully',
            $data
        );
    }

public function monitor_dashboard()
{
    $data = Ghaat::with(['district_record', 'registeredBoats'])
        ->get()
        ->groupBy('district_id')
        ->map(function ($ghaats, $districtId) {
            $districtName = $ghaats->first()->district_record->district_name ?? 'N/A';

            $totalGhaats = $ghaats->count();

            $totalBoats = $ghaats->sum(function ($ghaat) {
                return $ghaat->registeredBoats->count();
            });

            $totalCapacity = $ghaats->sum('boat_capacity');

            $latestUpdate = $ghaats->max('updated_at');
            $latestUpdateFormatted = \Carbon\Carbon::parse($latestUpdate)->format('Y-m-d');

            $fillPercentage = $totalCapacity > 0
                ? round(($totalBoats / $totalCapacity) * 100)
                : 0;

            // Status label based on fill percentage
            $status = 'Poor';
            if ($fillPercentage >= 85) {
                $status = 'Excellent';
            } elseif ($fillPercentage >= 70) {
                $status = 'Good';
            } elseif ($fillPercentage >= 60) {
                $status = 'Fair';
            }

            return [
                'district_id' => $districtId,
                'district_name' => $districtName,
                'total_ghaats' => $totalGhaats,
                'total_boats' => $totalBoats,
                'total_capacity' => $totalCapacity,
                'fill_percentage' => $fillPercentage . '%',
                'status' => $status,
                'latest_updated_at' => $latestUpdateFormatted,
            ];
        })
        ->values();

    return ApiResponse::generateResponse(
        'success',
        'Monitoring data fetched successfully',
        $data
    );
}



}




