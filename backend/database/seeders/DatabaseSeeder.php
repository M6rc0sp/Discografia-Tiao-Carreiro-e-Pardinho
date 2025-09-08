<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Criar usuário de teste apenas se ainda não existir (evita Unique constraint ao re-seedar)
        $adminName = env('DEFAULT_ADMIN_NAME', 'Test User');
        $adminEmail = env('DEFAULT_ADMIN_EMAIL', 'test@example.com');
        $adminPassword = env('DEFAULT_ADMIN_PASSWORD', 'password');

        if (! User::where('email', $adminEmail)->exists()) {
            User::factory()->create([
                'name' => $adminName,
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
            ]);
        }

        $this->call([
            \Database\Seeders\SongsTableSeeder::class,
        ]);
    }
}
