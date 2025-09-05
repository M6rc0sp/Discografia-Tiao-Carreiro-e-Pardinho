<?php

namespace App\Repositories;

use App\Models\Song;

interface SongRepositoryInterface
{
    public function findByYoutubeId(string $youtubeId): ?Song;

    public function findByTitle(string $title): ?Song;

    public function create(array $data): Song;
}
