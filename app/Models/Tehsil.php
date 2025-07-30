<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tehsil extends Model
{
      protected $table = 'tehsil_master'; 

    protected $fillable = ['district_code', 'tehsil_name','tehsil_code'];
}
