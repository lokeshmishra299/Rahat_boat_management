<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $table = 'districts'; 

    protected $fillable = ['district_name'];

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