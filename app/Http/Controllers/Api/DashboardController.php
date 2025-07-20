<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoatInspection;
use App\Models\District;
use App\Models\Ghaat;
use App\Models\LifeJacket;
use App\Models\RegisterBoat;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    //    public function stats()
    // {
    //     $now = Carbon::now();
    //     $thirtyDaysAgo = $now->copy()->subDays(30);

    //     // 🚤 Boats
    //     $totalBoats = RegisterBoat::count();
    //     $boatsLast30Days = RegisterBoat::where('created_at', '>=', $thirtyDaysAgo)->count();

    //     // 🛶 Ghaats
    //     $totalGhaats = Ghaat::count();
    //     $ghaatsLast30Days = Ghaat::where('created_at', '>=', $thirtyDaysAgo)->count();

    //     // 🏙️ Districts
    //     $totalDistricts = District::count();
    //     $districtsLast30Days = District::where('created_at', '>=', $thirtyDaysAgo)->count();

    //     // 🦺 Life Jackets
    //     $totalLifeJackets = LifeJacket::sum('total_jackets');
    //     $jacketsLast30Days = LifeJacket::where('created_at', '>=', $thirtyDaysAgo)
    //                                    ->sum('total_jackets');

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Dashboard stats fetched successfully.',
    //         'data' => [
    //             'total_boats' => [
    //                 'count' => $totalBoats,
    //                 'difference' => $boatsLast30Days, // ✅ Last 30 days
    //             ],
    //             'active_ghaats' => [
    //                 'count' => $totalGhaats,
    //                 'difference' => $ghaatsLast30Days,
    //             ],
    //             'districts_covered' => [
    //                 'count' => $totalDistricts,
    //                 'difference' => $districtsLast30Days,
    //             ],
    //             'life_jackets' => [
    //                 'count' => $totalLifeJackets,
    //                 'difference' => $jacketsLast30Days,
    //             ],
    //         ]
    //     ]);
    // }


    public function stats()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        $totalBoats = RegisterBoat::count();
        $boatsLast30Days = RegisterBoat::where('created_at', '>=', $thirtyDaysAgo)->count();

        $totalGhaats = Ghaat::count();
        $ghaatsLast30Days = Ghaat::where('created_at', '>=', $thirtyDaysAgo)->count();

        $totalDistricts = Ghaat::distinct('district_id')->count('district_id');
        $districtsLast30Days = Ghaat::where('created_at', '>=', $thirtyDaysAgo)
            ->distinct('district_id')
            ->count('district_id');


        $totalLifeJackets = LifeJacket::sum('total_jackets');
        $jacketsLast30Days = LifeJacket::where('created_at', '>=', $thirtyDaysAgo)->sum('total_jackets');

        $activities = [];

        $latestBoat = RegisterBoat::with('ghaat')->latest()->first();
        if ($latestBoat) {
            $activities[] = [
                'title' => 'New boat registered',
                'location' => $latestBoat->ghaat->ghaat_name ?? 'Unknown Ghaat',
                'status' => 'completed',
                'time_ago' => Carbon::parse($latestBoat->created_at)->diffForHumans(),
            ];
        }

        // $latestInspection = BoatInspection::with('boat.district')->latest()->first();
        // if ($latestInspection) {
        //     $activities[] = [
        //         'title' => 'Inspection completed',
        //         'location' => $latestInspection->boat->district->district_name ?? 'Unknown District',
        //         'status' => 'completed',
        //         'time_ago' => Carbon::parse($latestInspection->created_at)->diffForHumans(),
        //     ];
        // }

        $latestDistribution = LifeJacket::with('ghaat')->latest()->first();
        if ($latestDistribution) {
            $activities[] = [
                'title' => 'Life jackets distributed',
                'location' => $latestDistribution->ghaat->ghaat_name ?? 'Unknown Ghaat',
                'status' => 'completed',
                'time_ago' => Carbon::parse($latestDistribution->created_at)->diffForHumans(),
            ];
        }

        $latestMaintainedBoat = RegisterBoat::with('district')
            ->where('updated_at', '>=', now()->subDays(7))
            ->latest('updated_at')
            ->first();

        // if ($latestMaintainedBoat) {
        //     $activities[] = [
        //         'title' => 'Boat maintenance',
        //         'location' => $latestMaintainedBoat->district->district_name ?? 'Unknown District',
        //         'status' => 'pending',
        //         'time_ago' => Carbon::parse($latestMaintainedBoat->updated_at)->diffForHumans(),
        //     ];
        // }

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard stats fetched successfully.',
            'data' => [
                'total_boats' => [
                    'count' => $totalBoats,
                    'difference' => $boatsLast30Days,
                ],
                'active_ghaats' => [
                    'count' => $totalGhaats,
                    'difference' => $ghaatsLast30Days,
                ],
                'districts_covered' => [
                    'count' => $totalDistricts,
                    'difference' => $districtsLast30Days,
                ],
                'life_jackets' => [
                    'count' => $totalLifeJackets,
                    'difference' => $jacketsLast30Days,
                ],
                'recent_activities' => $activities,
            ]
        ]);
    }
}
