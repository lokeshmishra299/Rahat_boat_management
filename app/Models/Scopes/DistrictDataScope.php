<?php

namespace App\Models\Scopes;

use App\Models\District;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DistrictDataScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
{
    $user = Auth::user();

    if ($model instanceof District) {
        return;
    }

    if ($user && $user->role && $user->role->name === 'district_nodal') {
        Log::info('Applying district scope', [
            'user_id'     => $user->id,
            'district_id' => $user->district_id,
            'model'       => get_class($model),
        ]);

        $builder->where('district_id', $user->district_id);
    } else {
        Log::info('District scope not applied', [
            'user_id' => $user->id ?? null,
            'role'    => $user->role->name ?? null,
        ]);
    }
}

}

