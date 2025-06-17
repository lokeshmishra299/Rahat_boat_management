<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
     protected $table = 'blocks_master'; 

    protected $fillable = ['district_id', 'block_name'];
}
