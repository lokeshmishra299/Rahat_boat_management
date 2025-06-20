<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ghaat;
use Illuminate\Http\Request;

class DistrictController extends Controller
{
    public function index(){

        $ghaat=Ghaat::count();
        dd($ghaat);

    }
}
