<?php

namespace Tests\Feature;

use App\Models\Suggestion;
use App\Models\User;
use Tests\TestCase;

class SuggestionRejectRestoreTest extends TestCase
{
    public function test_reject_and_restore_change_status_and_timestamps()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $s = Suggestion::create(['title' => 'X', 'youtube_link' => 'https://youtu.be/zzz99999999', 'status' => 'pending']);

        $r = $this->postJson("/api/suggestions/{$s->id}/reject");
        $r->assertStatus(200)->assertJson(fn ($j) => $j->where('status', 'rejected')->etc());

        $s->refresh();
        $this->assertEquals('rejected', $s->status);
        $this->assertNotNull($s->rejected_at);

        $r2 = $this->postJson("/api/suggestions/{$s->id}/restore");
        $r2->assertStatus(200)->assertJson(fn ($j) => $j->where('status', 'pending')->etc());

        $s->refresh();
        $this->assertEquals('pending', $s->status);
        $this->assertNull($s->rejected_at);
    }
}
