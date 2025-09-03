#!/bin/bash
set -e


# Trabalhar diretamente no diretório corrente (backend)
# Se não houver um projeto Laravel (artisan), cria um novo no diretório atual
if [ ! -f "artisan" ]; then
  echo "Criando projeto Laravel 11 via composer..."
  composer create-project "laravel/laravel:^11.0" . --prefer-dist --no-interaction
fi

# Copia exemplo de env se não existir
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Garante diretório de storage
mkdir -p storage/logs
chmod -R 0777 storage bootstrap/cache

# Garante banco sqlite
if [ -z "$(ls database/*.sqlite 2>/dev/null)" ]; then
  touch database/database.sqlite || true
fi

# Instala dependências do composer (caso não instalado)
composer install --no-interaction --prefer-dist

# Gera chave
php artisan key:generate || true

# Instala Laravel Sanctum (para autenticação via API)
composer require laravel/sanctum --no-interaction || true
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider" --tag="migrations" || true

# Executa migrations (se existirem)
php artisan migrate --force || true

# Publica configuração do Sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider" --tag="config" || true

# Inicia servidor embutido para desenvolvimento apontando para o public do subdiretório
php -S 0.0.0.0:8000 -t public/
