<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoatOwner extends Model
{
    protected $table='boat_owner';

    protected $fillable=[

        'name',
        'district_id',
        'email',
        'number',
        'adhar_no',
        'boat_owned',
        'address',
        'pincode',
        'family',
        'relation',
    ];

    public function district(){

        return $this->belongsTo(District::class);
    }

    public function boatFamilyMembers()
    {
        return $this->hasMany(BoatFamilyMember::class, 'boat_owner_id');
    }
}
