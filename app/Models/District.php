<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $table = 'district_master'; 

    protected $fillable = ['district_name','district_code'];

      protected static function booted()
    {
        static::addGlobalScope(new DistrictDataScope);
    }


    public function users()
    {
        return $this->hasMany(User::class, 'district_id');
    }

    public function lifeJackets()
{
    return $this->hasMany(LifeJacket::class);
}
}