<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegisterBoat extends Model
{
        use HasFactory;

    protected $table='register_boats';

     protected $fillable = [
        'registration_no',
        'district_id',
        'image',
        'latitude',
        'longitude',
        'location',
        'pincode',
        'boat_type',
        'pilot_name',
        'pilot_license_no',
        'support_staff',
        'engine_details',
        'passenger_capacity',
        'year_of_manufacture',
        'ghaat_id',
        'registration_authority',
        'remarks',
    ];

    public function district()
{
    return $this->belongsTo(District::class, 'district_id');
}

public function ghaat()
{
    return $this->belongsTo(Ghaat::class, 'ghaat_id');
}

public function inspections()
{
    return $this->hasMany(BoatInspection::class, 'register_boat_id');
}

}
