<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse{


    public static function generateResponse(string $status, string $message, $data=null, int $code=200):JsonResponse
    {

        $response=[

            'status'=>$status,
            'message'=>$message,
        ];

        if(!is_null($data)){

            $response['data']=$data;
        }

        return response()->json($response,$code);
    }
}