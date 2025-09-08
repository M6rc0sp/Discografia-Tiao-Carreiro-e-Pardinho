<?php

namespace Tests\Unit;

use App\Repositories\SongRepositoryInterface;
use App\Services\SongService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SongServiceCreateTest extends TestCase
{
    public function test_create_from_suggestion_handles_missing_title_and_parses_views()
    {
        $repo = $this->createMock(SongRepositoryInterface::class);
        $repo->method('findByYoutubeId')->willReturn(null);
        $repo->method('findByTitle')->willReturn(null);
        $repo->method('create')->willReturnCallback(function ($data) {
            return new \App\Models\Song($data);
        });

        // fake Http facade to return body with title and viewCount
        Http::fake([
            '*' => Http::response('<title>My Video - YouTube</title>{"viewCount":"12345"}', 200),
        ]);

        $svc = new SongService($repo);
        $res = $svc->createFromSuggestion(['youtube_link' => 'https://youtu.be/dQw4w9WgXcQ']);

        $this->assertEquals('My Video', $res->title);
        $this->assertEquals(12345, $res->views);
    }
}
