<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
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

            protected static function booted()
    {
        static::addGlobalScope(new DistrictDataScope);
    }

    public function pilot(){

        return $this->belongsTo(Pilot::class);
    }
}
