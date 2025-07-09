<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegisterBoat extends Model
{
    use HasFactory;

    protected $table = 'register_boats';

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

        'owner_name',
        'owner_email',
        'owner_number',
        'owner_adhar_no',
        'owner_boat_owned',
        'owner_address',
        'owner_pincode',
        // 'owner_relation',
        'owner_dob',
        'owner_family_name',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new DistrictDataScope);
    }

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

//     public function boatFamilyMembers()
// {
//     return $this->hasMany(BoatFamilyMember::class, 'register_boat_id');
// }

}
