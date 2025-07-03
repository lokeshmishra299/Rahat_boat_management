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

    // Skip scope for District model itself
    if ($model instanceof District) {
        return;
    }

    // Apply district filter for both district_nodal and ghat_nodal users
    if (
        $user &&
        $user->role &&
        in_array($user->role->name, ['district_nodal', 'ghaat_nodal'])
    ) {
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

