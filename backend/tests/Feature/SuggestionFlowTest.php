<?php

namespace Tests\Feature;

use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class SuggestionFlowTest extends TestCase
{
    public function test_public_can_create_suggestion_and_admin_can_approve_reject_restore(): void
    {
        // create a suggestion as public user
        $payload = ['url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'];
        $res = $this->postJson('/api/suggestions', $payload);
        $res->assertStatus(201)->assertJson(fn (AssertableJson $json) => $json->where('youtube_link', $payload['url'])->etc()
        );

        $suggestionId = $res->json('id');
        $this->assertNotNull($suggestionId);

        // create an authenticated user and act as them
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // approve
        $approve = $this->postJson("/api/suggestions/{$suggestionId}/approve");
        $approve->assertStatus(200)->assertJson(fn (AssertableJson $json) => $json->where('status', 'approved')->etc()
        );

        // reject (should mark rejected)
        $reject = $this->postJson("/api/suggestions/{$suggestionId}/reject");
        $reject->assertStatus(200)->assertJson(fn (AssertableJson $json) => $json->where('status', 'rejected')->etc()
        );

        // restore
        $restore = $this->postJson("/api/suggestions/{$suggestionId}/restore");
        $restore->assertStatus(200)->assertJson(fn (AssertableJson $json) => $json->where('status', 'pending')->etc()
        );
    }
}
