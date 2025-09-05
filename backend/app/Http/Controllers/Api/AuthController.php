<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Registration disabled: users are managed out-of-band. Return 403 to make intent explicit.
        return response()->json(['message' => 'Registro desabilitado'], 403);
    }

    public function login(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        // login via session (Sanctum cookie-based)

        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        try {
            auth()->login($user);

            return response()->json($user);
        } catch (TokenMismatchException $e) {
            return response()->json(['message' => 'CSRF token mismatch'], 419);
        }
    }

    public function logout(Request $request)
    {
        // Ensure we logout the web guard and invalidate session (Sanctum cookie-based)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null, 204);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
