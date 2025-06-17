<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoatInspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InspectionController extends Controller
{
    public function conduct_inspection(Request $request)
{
    // dd($request->all());
    
    $validator = Validator::make($request->all(), [
        'boat_registration_number' => 'required|string|max:255|unique:boat_inspections,boat_registration_number',
        'inspection_date' => 'required|date',
        'inspector_name' => 'required|string|max:255',
        'inspector_id' => 'nullable|string|max:255',

        'hull_condition' => 'required|in:Good,Fair,Poor',
        'engine_condition' => 'required|in:Excellent,Good,Fair,Poor',
        'safety_equipment' => 'required|in:Complete,Partial,Inadequate',

        'inspection_checklist' => 'nullable|array', 

        'overall_status' => 'required|in:Passed,Failed,Conditional Pass',

        'recommendations' => 'nullable|string',
        'inspection_remarks' => 'nullable|string',

    ], [
        'boat_registration_number.required' => 'Boat registration number is required.',
        'inspection_date.required' => 'Inspection date is required.',
        'inspector_name.required' => 'Inspector name is required.',

        'hull_condition.required' => 'Hull condition is required.',
        'hull_condition.in' => 'Select a valid hull condition: Good, Fair, or Poor.',

        'engine_condition.required' => 'Engine condition is required.',
        'engine_condition.in' => 'Select a valid engine condition.',

        'safety_equipment.required' => 'Safety equipment status is required.',
        'safety_equipment.in' => 'Select a valid safety equipment status.',

        'overall_status.required' => 'Overall status is required.',
        'overall_status.in' => 'Overall status must be Passed, Failed, or Conditional Pass.',

        'inspection_checklist.array' => 'Inspection checklist must be a valid list.',

    ]);

    if ($validator->fails()) {
        $errors = collect($validator->errors()->toArray())
            ->map(fn($messages) => $messages[0]); 

        return ApiResponse::generateResponse(
            'error',
            'Validation failed.',
            $errors,
            422
        );
    }

    $inspection = BoatInspection::create([
        'boat_registration_number' => $request->boat_registration_number,
        'inspection_date' => $request->inspection_date,
        'inspector_name' => $request->inspector_name,
        'inspector_id' => $request->inspector_id,
        'hull_condition' => $request->hull_condition,
        'engine_condition' => $request->engine_condition,
        'safety_equipment' => $request->safety_equipment,
        'inspection_checklist' => json_encode($request->inspection_checklist),
        'overall_status' => $request->overall_status,
        'recommendations' => $request->recommendations,
        'inspection_remarks' => $request->inspection_remarks,
    ]);

    return ApiResponse::generateResponse(
        'success',
        'Inspection recorded successfully.',
        $inspection
    );
}
}
