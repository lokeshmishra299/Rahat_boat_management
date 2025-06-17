<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $table = 'districts_master'; 

    protected $fillable = ['district_name', 'short_code'];

    public function users()
    {
        return $this->hasMany(User::class, 'district_id');
    }
}