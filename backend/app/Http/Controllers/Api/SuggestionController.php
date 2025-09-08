<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use App\Services\SongService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http as HttpClient;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class SuggestionController extends Controller
{
    protected SongService $songService;

    public function __construct(SongService $songService)
    {
        $this->songService = $songService;
    }

    public function store(Request $request)
    {
        // Accept legacy 'url' param as alias for youtube_link
        $data = $request->all();

        if (empty($data['youtube_link']) && ! empty($data['url'])) {
            $data['youtube_link'] = $data['url'];
        }

        $v = Validator::make($data, [
            'title' => 'nullable|string|max:255',
            'youtube_link' => 'required|url',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        // If title missing, try to fetch it from YouTube page
        $title = $data['title'] ?? null;
        $youtubeLink = $data['youtube_link'];
        $youtubeId = $data['youtube_id'] ?? null;

        if (empty($title)) {
            // try to extract youtube id from link if not provided
            if (empty($youtubeId)) {
                $youtubeId = $this->extractVideoId($youtubeLink);
            }

            if (! empty($youtubeId)) {
                try {
                    $res = HttpClient::get('https://www.youtube.com/watch?v='.$youtubeId);
                    if ($res->successful()) {
                        // extract <title> content
                        if (preg_match('/<title>(.*?)<\/title>/is', $res->body(), $m)) {
                            $title = trim($m[1]);
                            // remove trailing "- YouTube" if present
                            $title = preg_replace('/\s*-\s*YouTube\s*$/i', '', $title);
                        }
                    }
                } catch (\Exception $e) {
                    // ignore fetching errors, fallback to using the link as title
                }
            }
        }

        // Fallback title to the link if nothing else
        if (empty($title)) {
            $title = $youtubeLink;
        }

        // Prevent duplicate suggestions with same link before creating
        if (Suggestion::where('youtube_link', $youtubeLink)->exists()) {
            return response()->json(['message' => 'Sugestão já existe'], 409);
        }

        try {
            $payload = [
                'title' => $title,
                'youtube_link' => $youtubeLink,
                'approved' => false,
            ];

            // include youtube_id only if the column exists in the table (some environments may not have run migrations)
            if (! empty($youtubeId) && Schema::hasColumn('suggestions', 'youtube_id')) {
                $payload['youtube_id'] = $youtubeId;
            }

            $s = Suggestion::create($payload);
        } catch (QueryException $e) {
            // sqlite and others use SQLSTATE 23000 for unique constraint
            $msg = $e->getMessage();
            if (str_contains($msg, 'UNIQUE constraint failed') || str_contains(strtolower($msg), 'unique')) {
                return response()->json(['message' => 'Sugestão já existe'], 409);
            }

            return response()->json(['message' => 'Erro no banco de dados'], 500);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Erro ao salvar sugestão'], 500);
        }

        return response()->json($s, 201);
    }

    public function index(Request $request)
    {
        // Return suggestions list for management: only unapproved by default
        $q = Suggestion::query();
        $only = $request->query('only');
        if ($only === 'unapproved') {
            $q->where('status', 'pending');
        } elseif ($only === 'rejected') {
            $q->where('status', 'rejected');
        }

        $list = $q->orderBy('created_at', 'desc')->get();

        return response()->json($list);
    }

    public function approve(Request $request, Suggestion $suggestion)
    {
        // Apenas usuário autenticado pode aprovar (middleware auth:sanctum)

        // Delegate creation/upsert to SongService
        $song = null;
        try {
            $song = $this->songService->createFromSuggestion($suggestion->toArray());
        } catch (\Throwable $e) {
            // swallow: we still want to mark suggestion approved
        }

        $suggestion->status = 'approved';
        $suggestion->approved_at = now();
        $suggestion->save();

        return response()->json($suggestion);
    }

    public function update(Request $request, Suggestion $suggestion)
    {
        // Apenas usuário autenticado pode editar (middleware auth:sanctum)
        $data = $request->all();
        if (empty($data['youtube_link']) && ! empty($data['url'])) {
            $data['youtube_link'] = $data['url'];
        }

        $v = Validator::make($data, [
            'title' => 'nullable|string|max:255',
            'youtube_link' => 'nullable|url',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        // If youtube_link updated, check duplicates
        if (! empty($data['youtube_link']) && $data['youtube_link'] !== $suggestion->youtube_link) {
            if (Suggestion::where('youtube_link', $data['youtube_link'])->exists()) {
                return response()->json(['message' => 'Outra sugestão com esse link já existe'], 409);
            }
            $suggestion->youtube_link = $data['youtube_link'];
        }

        if (array_key_exists('title', $data) && ! empty($data['title'])) {
            $suggestion->title = $data['title'];
        }

        $suggestion->save();

        return response()->json($suggestion);
    }

    public function destroy(Request $request, Suggestion $suggestion)
    {
        // Mark suggestion as rejected (keep record for possible review)
        $suggestion->status = 'rejected';
        $suggestion->rejected_at = now();
        $suggestion->save();

        return response()->json($suggestion);
    }

    // Optional explicit reject endpoint
    public function reject(Request $request, Suggestion $suggestion)
    {
        $suggestion->status = 'rejected';
        $suggestion->rejected_at = now();
        $suggestion->save();

        return response()->json($suggestion);
    }

    // Restore a rejected suggestion back to pending
    public function restore(Request $request, Suggestion $suggestion)
    {
        $suggestion->status = 'pending';
        $suggestion->rejected_at = null;
        $suggestion->approved_at = null;
        $suggestion->save();

        return response()->json($suggestion);
    }

    private function extractVideoId($url)
    {
        // patterns from v1 sugestir.php
        $patterns = [
            '/v=([\w-]{11})/i',
            '/youtu\.be\/([\w-]{11})/i',
            '/embed\/([\w-]{11})/i',
        ];
        foreach ($patterns as $pat) {
            if (preg_match($pat, $url, $m)) {
                return $m[1];
            }
        }

        return null;
    }
}
