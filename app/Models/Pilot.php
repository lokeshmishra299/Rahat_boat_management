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
        'family',
        'relation'
    ];
}
