<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoatInspection extends Model
{

    protected $table='boat_inspection';

    protected $fillable = [
        'register_boat_id',
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
        'status',
    ];

    protected $casts = [
        'inspection_checklist' => 'array',  // Auto JSON encode/decode
        'inspection_date' => 'date',
    ];

    public function boat()
    {
        return $this->belongsTo(RegisterBoat::class, 'register_boat_id');
    }
}