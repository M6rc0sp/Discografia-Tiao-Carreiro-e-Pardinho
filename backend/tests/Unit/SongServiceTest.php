<?php

namespace Tests\Unit;

use App\Services\SongService;
use PHPUnit\Framework\TestCase;

class SongServiceTest extends TestCase
{
    public function test_extract_video_id_variants()
    {
        $svc = new SongService($this->createMock(\App\Repositories\SongRepositoryInterface::class));
        $this->assertEquals('dQw4w9WgXcQ', $svc->extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $svc->extractVideoId('https://youtu.be/dQw4w9WgXcQ'));
        $this->assertNull($svc->extractVideoId('https://example.com'));
    }

    public function test_parse_views_formats()
    {
        $svc = new SongService($this->createMock(\App\Repositories\SongRepositoryInterface::class));
        $html = '"viewCount":"12345"';
        $this->assertEquals(12345, $svc->parseViews($html));

        $html2 = '"videoViewCountRenderer":{"simpleText":"1,234,567 views"}';
        $this->assertEquals(1234567, $svc->parseViews($html2));
    }
}
