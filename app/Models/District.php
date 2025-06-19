<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $table = 'districts'; 

    protected $fillable = ['district_name'];

    public function users()
    {
        return $this->hasMany(User::class, 'district_id');
    }
}