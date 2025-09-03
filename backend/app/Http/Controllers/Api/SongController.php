<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Song;
use Illuminate\Http\Request;

class SongController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 10;
        $songs = Song::orderBy('views', 'desc')->paginate($perPage);
        return response()->json($songs);
    }
}
