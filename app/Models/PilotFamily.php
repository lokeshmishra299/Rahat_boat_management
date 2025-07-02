<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PilotFamily extends Model
{
    protected $table = 'pilot_family';

    protected $fillable = [

        'pilot_id',
        'name',
        'mobile',
        'adhar',
        'relation'
    ];

    public function pilot(){

        return $this->belongsTo(Pilot::class);
    }
}
