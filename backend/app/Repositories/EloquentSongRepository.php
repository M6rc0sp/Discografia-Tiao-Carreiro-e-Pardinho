<?php

namespace App\Repositories;

use App\Models\Song;

class EloquentSongRepository implements SongRepositoryInterface
{
    public function findByYoutubeId(string $youtubeId): ?Song
    {
        return Song::where('youtube_id', $youtubeId)->first();
    }

    public function findByTitle(string $title): ?Song
    {
        return Song::where('title', $title)->first();
    }

    public function create(array $data): Song
    {
        return Song::create($data);
    }
}
