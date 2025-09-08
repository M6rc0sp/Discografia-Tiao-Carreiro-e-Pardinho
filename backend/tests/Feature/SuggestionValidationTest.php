<?php

namespace Tests\Feature;

use Tests\TestCase;

class SuggestionValidationTest extends TestCase
{
    public function test_creating_suggestion_requires_youtube_link()
    {
        $payload = ['title' => 'No link'];
        $res = $this->postJson('/api/suggestions', $payload);
        $res->assertStatus(422)->assertJsonStructure(['errors' => ['youtube_link']]);
    }
}
