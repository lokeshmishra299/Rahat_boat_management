<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class River extends Model
{
    protected $fillable = ['name'];

    public function ghaats()
    {
        return $this->hasMany(Ghaat::class);
    }
}
