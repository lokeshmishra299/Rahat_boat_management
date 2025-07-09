<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictMaster extends Model
{
    protected $table = 'district_master';

    protected $primaryKey = 'district_code'; 

    public $timestamps = false; 

    protected $fillable = [
        'district_code',
        'district_name',
        'dist_name_hi'
       
    ];
}
