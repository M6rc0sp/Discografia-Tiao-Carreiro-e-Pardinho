#!/bin/bash
set -e

# Entrypoint rodando dentro do container em /var/www/html
# Se não houver vendor, instala dependências
if [ ! -d vendor ]; then
  composer install --no-interaction --prefer-dist --no-progress || true
fi

# Copia .env.example para .env se não existir
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Cria DB sqlite se não existir
mkdir -p database
if [ ! -f database/database.sqlite ]; then
  touch database/database.sqlite
fi

# Gera chave e rodar migrations/seed (ignore failures durante develop)
php artisan key:generate || true
if [ ! -d vendor/laravel/sanctum ]; then
  composer require laravel/sanctum --no-interaction || true
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --tag="migrations" || true
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --tag="config" || true
fi
php artisan migrate --force || true
php artisan db:seed --force || true

# Inicia servidor PHP embutido
php -S 0.0.0.0:8000 -t public/
