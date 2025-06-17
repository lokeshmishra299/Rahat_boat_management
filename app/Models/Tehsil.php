<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tehsil extends Model
{
      protected $table = 'tehsils_master'; 

    protected $fillable = ['district_id', 'tehsil_name'];
}
