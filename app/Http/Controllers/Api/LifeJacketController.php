<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\LifeJacket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LifeJacketController extends Controller
{
public function store(Request $request)
{
    $user = auth()->user();

    if ($user && $user->role_id == 1) {
        $request->merge(['district_id' => $user->district_id]);
    }

    $validated = $request->validate([
        'ghaat_id'          => 'required|exists:ghaats,id',
        'district_id'       => 'required|exists:district_master,district_code',
        'no_of_boats'       => 'nullable', // Validate boat exists
        'total_jackets'     => 'required|integer|min:1',
        'distribution_date' => 'required|date',
        'received_by'       => 'required|string|max:255',
        'distribution_notes'=> 'nullable|string|max:255',
    ], [
        'ghaat_id.required'          => 'Ghaat is required.',
        'ghaat_id.exists'            => 'Selected ghaat does not exist.',
        'no_of_boats.required'       => 'Boat selection is required.',
        'no_of_boats.exists'         => 'Selected boat does not exist.',
        'total_jackets.required'     => 'Total jackets is required.',
        'distribution_date.required' => 'Distribution date is required.',
        'received_by.required'       => 'Receiver name is required.',
    ]);

    $lifeJacket = LifeJacket::create($validated);

    return ApiResponse::generateResponse('success', 'Life Jacket distributed successfully', $lifeJacket);
}

/* public function distribuation_tracking()
{
    $records = LifeJacket::with(['district', 'ghaat'])
        ->select(
            'district_id',
            'ghaat_id',
            'no_of_boats',
            'total_allocated_jackets',
            'total_jackets',
            'distribution_date',
            'status'
        )
        ->get();

    $totalAllocated   = $records->sum('total_allocated_jackets');
    $totalDistributed = $records->sum('total_jackets');

    $efficiency = $totalAllocated > 0
        ? round(($totalDistributed / $totalAllocated) * 100, 2)
        : 0;

    $formatted = $records->map(function ($item) {
        return [
            'district'           => $item->district->district_name ?? 'N/A',
            'ghaat'              => $item->ghaat->ghaat_name ?? 'N/A',
            'boats'              => $item->no_of_boats,
            'total_allocated'    => $item->total_allocated_jackets,
            'total_distributed'  => $item->total_jackets,
            'distribution_date'  => $item->distribution_date,
            'status'             => $item->status == 0 ? 'Completed' : 'Pending',
        ];
    });

    $response = [
        'summary' => [
            'total_allocated_jackets'   => $totalAllocated,
            'total_distributed_jackets' => $totalDistributed,
            'efficiency_percent'        => $efficiency . '%',

        ],
        'data' => $formatted
    ];

    return ApiResponse::generateResponse('success', 'Tracking data fetched successfully', $response);
}  */


public function distribuation_tracking()
{
    $records = LifeJacket::with(['district_record', 'ghaat'])
        ->select(
            'district_id',
            'ghaat_id',
            'no_of_boats',
            'total_allocated_jackets',
            'total_jackets',
            'distribution_date',
            'status'
        )
        ->get();

    // Group by district + ghaat
    $grouped = $records->groupBy(fn($item) => $item->district_id . '-' . $item->ghaat_id);

    $formatted = $grouped->map(function ($items) {
        $first = $items->first();

        return [
            'district'           => $first->district_record->district_name ?? 'N/A',
            'ghaat'              => $first->ghaat->ghaat_name ?? 'N/A',
            'boats'              => $items->sum('no_of_boats'),
            'total_allocated'    => $items->sum('total_allocated_jackets'),
            'total_distributed'  => $items->sum('total_jackets'),
            'status'             => $items->every(fn($i) => $i->status == 0) ? 'Completed' : 'Pending',
            'children'           => $items->map(function ($item) {
                return [
                    'boats'             => $item->no_of_boats,
                    'total_allocated'   => $item->total_allocated_jackets,
                    'total_distributed' => $item->total_jackets,
                    'distribution_date' => $item->distribution_date,
                    'status'            => $item->status == 0 ? 'Completed' : 'Pending',
                ];
            })->values()
        ];
    })->values();

    // Summary for all districts/ghaats
    $totalAllocated   = $records->sum('total_allocated_jackets');
    $totalDistributed = $records->sum('total_jackets');
    $efficiency = $totalAllocated > 0
        ? round(($totalDistributed / $totalAllocated) * 100, 2)
        : 0;

    return ApiResponse::generateResponse('success', 'Tracking data fetched successfully', [
        'summary' => [
            'total_allocated_jackets'   => $totalAllocated,
            'total_distributed_jackets' => $totalDistributed,
            'efficiency_percent'        => $efficiency . '%',
        ],
        'data' => $formatted,
    ]);
}

public function getBoatCountByGhat(Request $request)
{
    // dd($request->all());
    $ghaat_id = $request->ghat_id;
    $district_id = $request->district_id;

    if (!$ghaat_id || !$district_id) {
        return ApiResponse::generateResponse('error', 'Missing ghat or district information.', []);
    }


$totalCapacity = (int)DB::table('register_boats')
    ->where('ghaat_id', $ghaat_id)
    ->where('district_id', $district_id)
    ->sum('passenger_capacity');

// dd( $totalCapacity);

    return ApiResponse::generateResponse('success', 'Boat count fetched', [
        'district_id' => $district_id,
        'ghaat_id'    => $ghaat_id,
         'total_capacity'    => $totalCapacity
    ]);
}

}
