<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SongController;
use App\Http\Controllers\Api\SuggestionController;
use App\Http\Controllers\Api\AuthController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/songs', [SongController::class, 'index']);
Route::post('/suggestions', [SuggestionController::class, 'store']);
Route::post('/suggestions/{suggestion}/approve', [SuggestionController::class, 'approve'])->middleware('auth:sanctum');
Route::delete('/suggestions/{suggestion}', [SuggestionController::class, 'destroy'])->middleware('auth:sanctum');
