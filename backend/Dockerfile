FROM php:8.2-cli

ARG user=www-data
WORKDIR /var/www/html

# Dependências do sistema e extensões PHP necessárias
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libxml2-dev \
    libsqlite3-dev \
    curl \
    zip \
  && docker-php-ext-install pdo pdo_sqlite xml zip \
  && rm -rf /var/lib/apt/lists/*

# Instala Composer globalmente
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Copia scripts e define entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
