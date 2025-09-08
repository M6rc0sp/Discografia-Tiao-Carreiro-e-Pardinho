<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Song;
use App\Services\SongService;
use Illuminate\Http\Request;

class SongController extends Controller
{
    protected SongService $songService;

    public function __construct(SongService $songService)
    {
        $this->songService = $songService;
    }

    public function index(Request $request)
    {
        // Top 5 fixed (highest views)
        $top = Song::orderBy('views', 'desc')->limit(5)->get();

        // Remaining songs paginated (from 6th onward) - exclude top ids
        $perPage = 10;
        $topIds = $top->pluck('id')->toArray();
        $rest = Song::whereNotIn('id', $topIds)->orderBy('views', 'desc')->paginate($perPage);

        return response()->json([
            'top' => $top,
            'rest' => $rest,
        ]);
    }

    /**
     * Store a new Song (authenticated users)
     */
    public function store(Request $request)
    {
        $v = validator($request->all(), [
            'title' => 'nullable|string|max:255',
            'youtube_link' => 'required|url',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = $request->all();
        $youtubeId = $data['youtube_id'] ?? null;
        if (empty($youtubeId)) {
            // try to extract
            $youtubeId = $this->songService->extractVideoId($data['youtube_link'] ?? '');
        }

        try {
            $song = $this->songService->createFromSuggestion([
                'title' => $data['title'] ?? null,
                'youtube_link' => $data['youtube_link'],
                'youtube_id' => $youtubeId,
            ]);

            return response()->json($song, 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Erro ao criar música'], 500);
        }
    }

    /**
     * Update an existing Song (authenticated users)
     */
    public function update(Request $request, Song $song)
    {
        $v = validator($request->all(), [
            'title' => 'nullable|string|max:255',
            'youtube_link' => 'nullable|url',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = $request->all();
        if (array_key_exists('title', $data)) {
            $song->title = $data['title'];
        }

        if (! empty($data['youtube_link']) && $data['youtube_link'] !== $song->youtube_link) {
            // extract id and update thumb; don't try to create duplicates
            $youtubeId = $this->songService->extractVideoId($data['youtube_link']);
            if (! empty($youtubeId)) {
                $song->youtube_id = $youtubeId;
                $song->thumb = 'https://img.youtube.com/vi/'.$youtubeId.'/hqdefault.jpg';
                // attempt to refresh views
                try {
                    $res = \Illuminate\Support\Facades\Http::get('https://www.youtube.com/watch?v='.$youtubeId);
                    if ($res->successful()) {
                        $song->views = $this->songService->parseViews($res->body());
                    }
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        }

        $song->save();

        return response()->json($song);
    }

    /**
     * Delete a song (authenticated users)
     */
    public function destroy(Request $request, Song $song)
    {
        $song->delete();

        return response()->json(['message' => 'Deletado']);
    }
}
