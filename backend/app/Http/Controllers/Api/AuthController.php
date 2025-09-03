<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed'
        ]);

        if ($v->fails()) return response()->json(['errors'=>$v->errors()], 422);

        $user = User::create([
            'name'=>$request->name,
            'email'=>$request->email,
            'password'=>Hash::make($request->password)
        ]);

        return response()->json($user, 201);
    }

    public function login(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'=>'required|email',
            'password'=>'required'
        ]);

        if ($v->fails()) return response()->json(['errors'=>$v->errors()], 422);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message'=>'Credenciais inválidas'], 401);
        }

        // Autenticação via sessão (Sanctum cookie-based)
        auth()->login($user);

        return response()->json($user);
    }

    public function logout(Request $request)
    {
        auth()->logout();
        return response()->json(null, 204);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
