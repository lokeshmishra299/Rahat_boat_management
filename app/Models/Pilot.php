<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pilot extends Model
{
    protected $table='pilot';

    protected $fillable=[

        'name',
        'email',
        'no_of_boat',
        'registration_no',
        'relation',
        'adhar',
        'dob',
        'number'
    ];

    public function pilotFamily()
{
    return $this->hasMany(PilotFamily::class, 'pilot_id');
}

    public function district(){

        return $this->belongsTo(District::class);
    }

}
