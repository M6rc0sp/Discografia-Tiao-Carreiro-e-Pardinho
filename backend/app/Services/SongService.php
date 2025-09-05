<?php

namespace App\Services;

use App\Repositories\SongRepositoryInterface;
use Illuminate\Support\Facades\Http as HttpClient;

class SongService
{
    protected SongRepositoryInterface $repo;

    public function __construct(SongRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function createFromSuggestion(array $suggestionData)
    {
        // Expect keys: title?, youtube_link?, youtube_id?
        $youtubeId = $suggestionData['youtube_id'] ?? null;
        if (empty($youtubeId) && ! empty($suggestionData['youtube_link'])) {
            $youtubeId = $this->extractVideoId($suggestionData['youtube_link']);
        }

        $title = $suggestionData['title'] ?? null;

        $views = 0;

        if (! empty($youtubeId)) {
            try {
                $res = HttpClient::get('https://www.youtube.com/watch?v='.$youtubeId);
                if ($res->successful()) {
                    // fill title if missing
                    if (empty($title) && preg_match('/<title>(.*?)<\/title>/is', $res->body(), $m)) {
                        $title = trim(preg_replace('/\s*-\s*YouTube\s*$/i', '', $m[1]));
                    }

                    // attempt to parse views regardless of whether title was present
                    $views = $this->parseViews($res->body());
                }
            } catch (\Throwable $e) {
                // ignore network/parse errors
            }
        }

        if (empty($title)) {
            $title = $suggestionData['youtube_link'] ?? 'Untitled';
        }

        // Avoid duplicate by youtube_id or title
        if (! empty($youtubeId)) {
            $existing = $this->repo->findByYoutubeId($youtubeId);
            if ($existing) {
                return $existing;
            }
        } else {
            $existing = $this->repo->findByTitle($title);
            if ($existing) {
                return $existing;
            }
        }

        $payload = [
            'title' => $title,
            'views' => $views ?? 0,
            'youtube_id' => $youtubeId ?? '',
            'thumb' => ! empty($youtubeId) ? 'https://img.youtube.com/vi/'.$youtubeId.'/hqdefault.jpg' : '',
        ];

        return $this->repo->create($payload);
    }

    private function extractVideoId(string $url): ?string
    {
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

    private function parseViews(string $body): int
    {
        // Try numeric viewCount first
        if (preg_match('/"viewCount"\s*:\s*"(\d+)"/i', $body, $m)) {
            return (int) $m[1];
        }

        // Try viewCount with simpleText like "1,234,567 views" or "1.234.567"
        if (preg_match('/"viewCount"\s*:\s*{[^}]*"simpleText"\s*:\s*"([\d\.,]+)(?:\s*views?)?"/i', $body, $m)) {
            $num = preg_replace('/\D/', '', $m[1]);

            return (int) $num;
        }

        // Fallback: try to find occurrences like "viewCount":{..."videoViewCountRenderer"..."simpleText":"1,234,567 views"}
        if (preg_match('/"videoViewCountRenderer"[^{]*\{[^}]*"simpleText"\s*:\s*"([\d\.,]+)\s*views?/i', $body, $m)) {
            $num = preg_replace('/\D/', '', $m[1]);

            return (int) $num;
        }

        return 0;
    }
}
