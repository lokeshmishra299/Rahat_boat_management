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
}
