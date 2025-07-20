<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\Role as ModelsRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;


class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,SoftDeletes;
    // use HasRoles;
    use HasApiTokens;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    
    protected $fillable = [
        'name', 'email', 'district_id', 'designation_id', 'role_id','password1','password','otp','number','user_name','deleted_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // public function district()
    // {
    //     return $this->belongsTo(District::class);
    // }

    public function district()
{
    return $this->belongsTo(DistrictMaster::class, 'district_id', 'district_code');
}


    

      public function designation()
    {
        return $this->belongsTo(Designation::class);
    }
    
// public function roles()
// {
//     return $this->belongsToMany(Role::class, 'model_has_roles', 'model_id', 'role_id');
// }

public function role() {
    return $this->belongsTo(Role::class);
}
}
