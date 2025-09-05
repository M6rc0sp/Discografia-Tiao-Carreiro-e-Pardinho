<?php

return [
    'stateful' => array_filter(array_map('trim', explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:5173,127.0.0.1:5173')))),
    'guard' => ['web'],
    'expiration' => null,
    'middleware' => [
        'verify_csrf_token' => \App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => \App\Http\Middleware\EncryptCookies::class,
    ],
];
