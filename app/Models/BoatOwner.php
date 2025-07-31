<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
use Illuminate\Database\Eloquent\Model;

class BoatOwner extends Model
{
    protected $table = 'boat_owner';

    protected $fillable = [

        'name',
        'district_id',
        'email',
        'number',
        'adhar_no',
        'boat_owned',
        // 'address',
        'pincode',
        'family',
        'owner_family_name',
        'dob',
        'latitude',
        'longitude',
        'location',
        'image',
        'user_id',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new DistrictDataScope);
    }

    // public function district()
    // {

    //     return $this->belongsTo(District::class);
    // }


    public function district()
{
    return $this->hasOne(DistrictMaster::class, 'district_code', 'district_id');
}

    public function boatFamilyMembers()
    {
        return $this->hasMany(BoatFamilyMember::class, 'boat_owner_id');
    }

    public function boats()
{
    return $this->hasMany(RegisterBoat::class, 'boat_owner_id');
}

public function tehsil()
{
    return $this->belongsTo(Tehsil::class, 'tehsil_id');
}
public function user()
{
    return $this->belongsTo(User::class, 'user_id');
}

}
