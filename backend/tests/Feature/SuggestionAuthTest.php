<?php

namespace Tests\Feature;

use App\Models\Suggestion;
use Tests\TestCase;

class SuggestionAuthTest extends TestCase
{
    public function test_approve_requires_authentication()
    {
        $s = Suggestion::create([
            'title' => 'X',
            'youtube_link' => 'https://youtu.be/xyz12345678',
            'status' => 'pending',
        ]);
        $res = $this->postJson("/api/suggestions/{$s->id}/approve");
        $res->assertStatus(401);
    }
}
