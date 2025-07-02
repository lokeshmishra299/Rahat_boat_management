<?php

namespace App\Models;

use App\Models\Scopes\DistrictDataScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LifeJacket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ghaat_id',
        'district_id',
        'no_of_boats',
        'jackets_per_boat',
        'total_jackets',
        'distribution_date',
        'received_by',
        'phone',
        'distribution_notes',
        'total_allocated_jackets',
        'status',
    ];

        protected static function booted()
    {
        static::addGlobalScope(new DistrictDataScope);
    }

    public function ghaat()
    {
        return $this->belongsTo(Ghaat::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
