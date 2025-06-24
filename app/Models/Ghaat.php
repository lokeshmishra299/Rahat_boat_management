<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ghaat extends Model
{
    use HasFactory;

    protected $table = 'ghaats';

    protected $fillable = [
        'photo_path',
        'latitude',
        'longitude',
        'location',
        'pincode',
        'ghaat_name',
        'district_id',
        'river_id',
        'boat_capacity',
        'road_accessibility',
        'contact_person',
        'contact_number',
        'nearest_hospital',
        'available_facilities',
        'additional_info',
        'status'
    ];

    public function river()
    {
        return $this->belongsTo(River::class);
    }

    public function river_record()
    {

        return $this->hasOne(River::class, 'id', 'river_id');
    }

    public function district_record()
    {

        return $this->hasOne(District::class, 'id', 'district_id');
    }

    public function registeredBoats()
    {
        return $this->hasMany(RegisterBoat::class, 'ghaat_id');
    }

    public function lifeJackets()
{
    return $this->hasMany(LifeJacket::class);
}
}
