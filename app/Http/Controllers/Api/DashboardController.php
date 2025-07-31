<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoatInspection;
use App\Models\BoatOwner;
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


    // public function stats()
    // {
    //     $now = Carbon::now();
    //     $thirtyDaysAgo = $now->copy()->subDays(30);

    //     $totalBoats = RegisterBoat::count();
    //     $boatsLast30Days = RegisterBoat::where('created_at', '>=', $thirtyDaysAgo)->count();

    //     $totalGhaats = Ghaat::count();
    //     $ghaatsLast30Days = Ghaat::where('created_at', '>=', $thirtyDaysAgo)->count();

    //     $totalDistricts = Ghaat::distinct('district_id')->count('district_id');
    //     $districtsLast30Days = Ghaat::where('created_at', '>=', $thirtyDaysAgo)
    //         ->distinct('district_id')
    //         ->count('district_id');


    //     $totalLifeJackets = LifeJacket::sum('total_jackets');
    //     $jacketsLast30Days = LifeJacket::where('created_at', '>=', $thirtyDaysAgo)->sum('total_jackets');

    //     $activities = [];

    //     $latestBoat = RegisterBoat::with('ghaat')->latest()->first();
    //     if ($latestBoat) {
    //         $activities[] = [
    //             'title' => 'New boat registered',
    //             'location' => $latestBoat->ghaat->ghaat_name ?? 'Unknown Ghaat',
    //             'status' => 'completed',
    //             'time_ago' => Carbon::parse($latestBoat->created_at)->diffForHumans(),
    //         ];
    //     }

    //     // $latestInspection = BoatInspection::with('boat.district')->latest()->first();
    //     // if ($latestInspection) {
    //     //     $activities[] = [
    //     //         'title' => 'Inspection completed',
    //     //         'location' => $latestInspection->boat->district->district_name ?? 'Unknown District',
    //     //         'status' => 'completed',
    //     //         'time_ago' => Carbon::parse($latestInspection->created_at)->diffForHumans(),
    //     //     ];
    //     // }

    //     $latestDistribution = LifeJacket::with('ghaat')->latest()->first();
    //     if ($latestDistribution) {
    //         $activities[] = [
    //             'title' => 'Life jackets distributed',
    //             'location' => $latestDistribution->ghaat->ghaat_name ?? 'Unknown Ghaat',
    //             'status' => 'completed',
    //             'time_ago' => Carbon::parse($latestDistribution->created_at)->diffForHumans(),
    //         ];
    //     }

    //     $latestMaintainedBoat = RegisterBoat::with('district')
    //         ->where('updated_at', '>=', now()->subDays(7))
    //         ->latest('updated_at')
    //         ->first();

    //         $boatOwnerCount = BoatOwner::count();
    // $boatOwnersLast30Days = BoatOwner::where('created_at', '>=', $thirtyDaysAgo)->count();

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Dashboard stats fetched successfully.',
    //         'data' => [
    //             'total_boats' => [
    //                 'count' => $totalBoats,
    //                 'difference' => $boatsLast30Days,
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
    //            'boat_owners' => [
    //             'count' => $boatOwnerCount,
    //             'difference' => $boatOwnersLast30Days,
    //         ],
    //             'recent_activities' => $activities,
    //         ]
    //     ]);
    // }

        public function stats()
{
    $user = auth()->user();
    $now = Carbon::now();
    $thirtyDaysAgo = $now->copy()->subDays(30);
    $sevenDaysAgo = $now->copy()->subDays(7);

    // Apply user_id filter only for role_id == 2
    $filterByUser = $user->role_id == 2;

    $boatQuery = RegisterBoat::query();
    $ghaatQuery = Ghaat::query();
    $ownerQuery = BoatOwner::query();

    if ($filterByUser) {
        $boatQuery->where('user_id', $user->id);
        $ghaatQuery->where('user_id', $user->id);
        $ownerQuery->where('user_id', $user->id);
    }

    // Life jacket stats are global, no user_id filter
    $lifeJacketQuery = LifeJacket::query();

    // === Stats ===
    $totalBoats = $boatQuery->count();
    $boatsLast30Days = (clone $boatQuery)->where('created_at', '>=', $thirtyDaysAgo)->count();

    $totalGhaats = $ghaatQuery->count();
    $ghaatsLast30Days = (clone $ghaatQuery)->where('created_at', '>=', $thirtyDaysAgo)->count();

    $totalDistricts = (clone $ghaatQuery)->distinct('district_id')->count('district_id');
    $districtsLast30Days = (clone $ghaatQuery)
        ->where('created_at', '>=', $thirtyDaysAgo)
        ->distinct('district_id')
        ->count('district_id');

    $totalLifeJackets = $lifeJacketQuery->sum('total_jackets');
    $jacketsLast30Days = (clone $lifeJacketQuery)->where('created_at', '>=', $thirtyDaysAgo)->sum('total_jackets');

    $boatOwnerCount = $ownerQuery->count();
    $boatOwnersLast30Days = (clone $ownerQuery)->where('created_at', '>=', $thirtyDaysAgo)->count();

    // === Recent Activities ===
    $activities = [];

    $latestBoat = (clone $boatQuery)->with('ghaat')->latest()->first();
    if ($latestBoat) {
        $activities[] = [
            'title' => 'New boat registered',
            'location' => optional($latestBoat->ghaat)->ghaat_name ?? 'Unknown Ghaat',
            'status' => 'completed',
            'time_ago' => $latestBoat->created_at->diffForHumans(),
        ];
    }

    $latestMaintainedBoat = (clone $boatQuery)->with('district')
        ->where('updated_at', '>=', $sevenDaysAgo)
        ->latest('updated_at')
        ->first();

    if ($latestMaintainedBoat) {
        $activities[] = [
            'title' => 'Boat maintenance',
            'location' => optional($latestMaintainedBoat->district)->district_name ?? 'Unknown District',
            'status' => 'pending',
            'time_ago' => $latestMaintainedBoat->updated_at->diffForHumans(),
        ];
    }

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
            'boat_owners' => [
                'count' => $boatOwnerCount,
                'difference' => $boatOwnersLast30Days,
            ],
            'recent_activities' => $activities,
        ],
    ]);
}


}
