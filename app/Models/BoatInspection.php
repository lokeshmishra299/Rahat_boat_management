<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoatInspection extends Model
{
    protected $fillable = [
        'boat_registration_number',
        'inspection_date',
        'inspector_name',
        'inspector_id',
        'hull_condition',
        'engine_condition',
        'safety_equipment',
        'inspection_checklist',
        'overall_status',
        'recommendations',
        'inspection_remarks',
    ];
}
