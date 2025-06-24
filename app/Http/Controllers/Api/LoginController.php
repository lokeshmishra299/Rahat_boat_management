<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email'    => 'required|email',
                'password' => 'required|min:6',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $user = User::where('email', $request->email)->first();

            if (! $user) {
                return ApiResponse::generateResponse('error', 'Wrong email.', null, 401);
            }

            if (! Hash::check($request->password, $user->password)) {
                return ApiResponse::generateResponse('error', 'Wrong password.', null, 401);
            }

            if ($user->status == 0) {
                return ApiResponse::generateResponse('error', 'You are blocked by admin.', null, 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return ApiResponse::generateResponse('success', 'Login successful.', [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user,
            ]);

        } catch (ValidationException $e) {
            $errors = collect($e->validator->errors()->toArray())
                ->map(fn($messages) => $messages[0]); 

            return ApiResponse::generateResponse('error', 'Validation failed.', $errors, 422);
        } catch (\Exception $e) {
            return ApiResponse::generateResponse('error', 'Something went wrong during login.', [
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function forgotPasswordCheck(Request $request)
{
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (! $user) {
        return ApiResponse::generateResponse('error', 'Email not found.', null, 404);
    }

    return ApiResponse::generateResponse('success', 'Email found. Proceed to send OTP.');
}


public function sendOtp(Request $request)
{
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (! $user) {
        return ApiResponse::generateResponse('error', 'Email not found.', null, 404);
    }

    $user->otp = '12345'; 
    $user->save();

    return ApiResponse::generateResponse('success', 'OTP sent successfully.');
}


    public function user(Request $request)
    {
        return ApiResponse::generateResponse('success', 'User fetched successfully.', $request->user());
    }

    public function logout(Request $request){

        $request->user()->currentAccessToken()->delete();

        return ApiResponse::generateResponse('success','Logout Successfully');
    }
}
