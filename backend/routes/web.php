<?php

use Illuminate\Support\Facades\Route;

// Minimal API-only web routes so the framework can bootstrap without Blade.
Route::get('/', function () {
    return response()->json(['status' => 'API', 'message' => 'Backend API running']);
});

// Minimal named login route to satisfy middleware redirects in an API-only app.
// This prevents RouteNotFoundException when Authenticate middleware attempts to
// generate a login URL for unauthenticated requests.
Route::get('/login', function () {
    return response()->json(['message' => 'Login route - use API /sanctum/csrf-cookie and /api/login for SPA auth'], 200);
})->name('login');
