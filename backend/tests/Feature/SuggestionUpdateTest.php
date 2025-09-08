<?php

namespace Tests\Feature;

use App\Models\Suggestion;
use Tests\TestCase;

class SuggestionUpdateTest extends TestCase
{
    public function test_updating_to_existing_link_returns_409()
    {
        $s1 = Suggestion::create(['title' => 'A', 'youtube_link' => 'https://youtu.be/aaa11111111', 'status' => 'pending']);
        $s2 = Suggestion::create(['title' => 'B', 'youtube_link' => 'https://youtu.be/bbb22222222', 'status' => 'pending']);

        // try to update s2 to have s1's link
        $this->actingAs(\App\Models\User::factory()->create(), 'sanctum');
        $res = $this->patchJson("/api/suggestions/{$s2->id}", ['youtube_link' => $s1->youtube_link]);
        $res->assertStatus(409);
    }
}
