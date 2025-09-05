<?php

namespace App\Providers;

use App\Repositories\EloquentSongRepository;
use App\Repositories\SongRepositoryInterface;
use App\Services\SongService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind repository interface to Eloquent implementation
        $this->app->bind(SongRepositoryInterface::class, EloquentSongRepository::class);

        // Make SongService available for injection
        $this->app->singleton(SongService::class, function ($app) {
            return new SongService($app->make(SongRepositoryInterface::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
