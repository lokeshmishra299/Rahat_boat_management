<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatInspection;
use App\Models\RegisterBoat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;


class InspectionController extends Controller
{
    public function conduct_inspection(Request $request)
{
    $validator = Validator::make($request->all(), [
        'register_boat_id'        => 'required|exists:register_boats,id',
        'inspection_date'         => 'required|date',
        'inspector_name'          => 'required|string|max:255',
        'inspector_id'            => 'nullable|string|max:255',

        'hull_condition'          => 'required|in:Good,Fair,Poor',
        'engine_condition'        => 'required|in:Excellent,Good,Fair,Poor',
        'safety_equipment'        => 'required|in:Complete,Partial,Inadequate',

        'inspection_checklist'    => 'nullable|array',

        'overall_status'          => 'required|in:Passed,Failed,Conditional Pass',
        'recommendations'         => 'nullable|string',
        'inspection_remarks'      => 'nullable|string',

    ], [
        'register_boat_id.required'       => 'Boat registration is required.',
        'register_boat_id.exists'         => 'Boat registration number does not exist in records.',

        'inspection_date.required'        => 'Inspection date is required.',
        'inspection_date.date'            => 'Inspection date must be a valid date.',

        'inspector_name.required'         => 'Inspector name is required.',
        'inspector_name.string'           => 'Inspector name must be a valid string.',
        'inspector_name.max'              => 'Inspector name may not be greater than 255 characters.',

        'inspector_id.string'             => 'Inspector ID must be a valid string.',
        'inspector_id.max'                => 'Inspector ID may not be greater than 255 characters.',

        'hull_condition.required'         => 'Hull condition is required.',
        'hull_condition.in'               => 'Hull condition must be Good, Fair, or Poor.',

        'engine_condition.required'       => 'Engine condition is required.',
        'engine_condition.in'             => 'Engine condition must be Excellent, Good, Fair, or Poor.',

        'safety_equipment.required'       => 'Safety equipment status is required.',
        'safety_equipment.in'             => 'Safety equipment must be Complete, Partial, or Inadequate.',

        'inspection_checklist.array'      => 'Inspection checklist must be a list of items.',

        'overall_status.required'         => 'Overall status is required.',
        'overall_status.in'               => 'Overall status must be Passed, Failed, or Conditional Pass.',

        'recommendations.string'          => 'Recommendations must be a valid string.',
        'inspection_remarks.string'       => 'Remarks must be a valid string.',
    ]);

    if ($validator->fails()) {
        return ApiResponse::generateResponse(
            'error',
            'Validation failed',
            $validator->errors(),
            422
        );
    }

    $inspection = BoatInspection::create([
        'register_boat_id'        => $request->register_boat_id,
        'inspection_date'         => $request->inspection_date,
        'inspector_name'          => $request->inspector_name,
        'inspector_id'            => $request->inspector_id,
        'hull_condition'          => $request->hull_condition,
        'engine_condition'        => $request->engine_condition,
        'safety_equipment'        => $request->safety_equipment,
        'inspection_checklist' => $request->inspection_checklist,
        'overall_status'          => $request->overall_status,
        'recommendations'         => $request->recommendations,
        'inspection_remarks'      => $request->inspection_remarks,
    ]);

    return ApiResponse::generateResponse(
        'success',
        'Inspection recorded successfully.',
        $inspection
    );
}



public function getBoatIdByRegistration(Request $request)
{
    $request->validate([
        'registration_no' => 'required|string'
    ]);

    $boat = RegisterBoat::where('registration_no', $request->registration_no)->first();

    if (!$boat) {
        return response()->json([
            'status' => 'error',
            'message' => 'Boat not found',
        ], 404);
    }

    return response()->json([
        'status' => 'success',
        'data' => ['id' => $boat->id],
    ]);
}

public function view_inspection(){

    $inspection=BoatInspection::with('boat.district')->get();
    // dd($inspection);

    return ApiResponse::generateResponse('success','Inspection records fetched successfully',$inspection,200);
}

public function view_inspection_by_id($id)
{
    $inspection = BoatInspection::with('boat.ghaat','boat.district')->find($id);

    if (!$inspection) {
        return ApiResponse::generateResponse(
            'error',
            'Inspection record not found.',
            null,
            404
        );
    }

    return ApiResponse::generateResponse(
        'success',
        'Inspection record fetched successfully.',
        $inspection
    );
}

public function upcoming_inspections()
{
    $today = Carbon::now();
    $upcoming = [];

    $inspections = BoatInspection::with('boat.district')->get();

    foreach ($inspections as $inspection) {
        $lastInspectionDate = Carbon::parse($inspection->inspection_date);

        $nextDueDate = $lastInspectionDate->copy()->addYear();

        $daysLeft = (int)$today->diffInDays($nextDueDate, false);

        if ($daysLeft >= 0 && $daysLeft <= 30) {
            $upcoming[] = [
                'registration_no' => $inspection->boat->registration_no ?? 'N/A',
                'district'        => $inspection->boat->district->district_name ?? 'N/A',
                'due_date'        => $nextDueDate->format('Y-m-d'),
                'days_left'       => $daysLeft,
            ];
        }
    }

    return ApiResponse::generateResponse(
        'success',
        'Upcoming inspections fetched successfully.',
        $upcoming
    );
}

public function analytics(){

$data=[
    'total_boat'           => $boat = RegisterBoat::count(),
    'total_inspected'      => $inspected = BoatInspection::count(),
    'pending'              => $boat - $inspected,
    'pass_rate_percent'    => $boat ? round(($inspected / $boat) * 100, 2) : 0,
    'passed'               => BoatInspection::where('overall_status', 'Passed')->count(),
    'failed'               => BoatInspection::where('overall_status', 'Failed')->count(),
    'conditional_pass'     => BoatInspection::where('overall_status', 'Conditional Pass')->count(),
];

return ApiResponse::generateResponse('success','Analytics fetch successfully',$data,200);

}

public function registration_no_list(){

    $boat=RegisterBoat::select('registration_no')->get();
    // dd($boat->toArray());
    
    return ApiResponse::generateResponse('success','Registered boat name fetched successfully',$boat,200);
}

}
