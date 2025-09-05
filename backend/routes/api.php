<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SongController;
use App\Http\Controllers\Api\SuggestionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::get('/songs', [SongController::class, 'index']);

// protected song management (auth required)
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::post('/songs', [SongController::class, 'store']);
    Route::put('/songs/{song}', [SongController::class, 'update']);
    Route::patch('/songs/{song}', [SongController::class, 'update']);
    Route::delete('/songs/{song}', [SongController::class, 'destroy']);
});

// public create
Route::post('/suggestions', [SuggestionController::class, 'store']);

// management: list suggestions (requires auth) - these need the web middleware so session is available
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/suggestions', [SuggestionController::class, 'index']);
    Route::post('/suggestions/{suggestion}/approve', [SuggestionController::class, 'approve']);
    Route::put('/suggestions/{suggestion}', [SuggestionController::class, 'update']);
    Route::patch('/suggestions/{suggestion}', [SuggestionController::class, 'update']);
    Route::delete('/suggestions/{suggestion}', [SuggestionController::class, 'destroy']);
});
