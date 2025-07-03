<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
use Illuminate\Database\Eloquent\Model;

class BoatFamilyMember extends Model
{
    protected $table="family_members";

    protected $fillable=[
        'boat_owner_id',
        'name',
        'mobile',
        'adhar',
        'relation',
    ];



    public function boatOwner(){

        return $this->belongsTo(BoatOwner::class);
    }
}
