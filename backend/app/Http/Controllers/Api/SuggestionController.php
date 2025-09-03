<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SuggestionController extends Controller
{
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'youtube_link' => 'required|url'
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $s = Suggestion::create([
            'title' => $request->title,
            'youtube_link' => $request->youtube_link,
            'approved' => false,
            'user_id' => $request->user()?->id
        ]);

        return response()->json($s, 201);
    }

    public function approve(Request $request, Suggestion $suggestion)
    {
        // Apenas usuário autenticado pode aprovar (middleware auth:sanctum)
        $suggestion->approved = true;
        $suggestion->save();
        return response()->json($suggestion);
    }

    public function destroy(Request $request, Suggestion $suggestion)
    {
        // Apenas usuário autenticado
        $suggestion->delete();
        return response()->json(null, 204);
    }
}
