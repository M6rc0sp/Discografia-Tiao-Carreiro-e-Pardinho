# Discografia Tião Carreiro e Pardinho (monorepo)

Este repositório contém a versão atualizada (v2) do projeto, separada em:

- `backend/` — API em Laravel (Sanctum, SQLite para dev)
- `frontend/` — SPA React (Vite)
- `archive/v1/` — código antigo (v1) preservado para referência

O fluxo de desenvolvimento aqui é "Docker-first": os serviços rodam em containers e o Docker Compose orquestra tudo.

## Pré-requisitos

- Docker (20+) e Docker Compose (v2) instalados e funcionando
- Acesso à internet para baixar imagens e dependências na primeira execução

## Quickstart (desenvolvimento)

1. A partir da raiz do repositório:

```bash
docker compose up --build -d
```

2. Verificar logs se necessário:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

3. Abrir no navegador:

- Frontend (Vite dev server): http://localhost:5173/
- Backend API (dev server): http://localhost:8000/  (endpoints em `/api`)

### Migrar / popular banco (quando necessário)

```bash
docker compose exec backend bash -lc "php artisan migrate --force && php artisan db:seed --force"
```

### Acesso à API localmente

- API principal: `http://localhost:8000/api/songs`
- Autenticação (Sanctum cookie-based): antes de tentar login a partir do SPA, faça uma requisição GET para `/sanctum/csrf-cookie` para inicializar o cookie CSRF.

Exemplo com axios no frontend:

```js
axios.defaults.withCredentials = true;
await axios.get(`${VITE_API_BASE}/sanctum/csrf-cookie`);
await axios.post(`${VITE_API_BASE}/login`, { email, password });
```

## Notas sobre volumes e node_modules

Para desenvolvimento o `docker-compose.yml` monta o código local em `/app` e preserva `node_modules` dentro de um volume nomeado para evitar que o bind mount sobrescreva as dependências instaladas na imagem. Isso permite editar código localmente sem perder os binários (como `vite`) instalados na imagem.

Para produção/CI é recomendável não usar bind mounts e usar apenas a imagem construída (remova os volumes/bind-mounts).

## Produção

Este repositório traz uma configuração simples para desenvolvimento. Para produção recomenda-se:

- usar um servidor real (nginx + php-fpm) para o backend
- construir o frontend (`npm run build`) e servir os arquivos estáticos por um CDN/nginx
- configurar um banco persistente (MySQL/Postgres) e guardar secrets em variáveis de ambiente

## Testes

- Backend (PHPUnit):

```bash
docker compose exec backend bash -lc "./vendor/bin/phpunit --colors=always"
```

- Frontend (Vitest):

```bash
docker compose exec frontend bash -lc "npm test"
```

## Estrutura do repositório

- `backend/` — Laravel app (código, migrations, seeders)
- `frontend/` — React (Vite)
- `archive/v1/` — cópia do código original v1 (PHP estático)

## Troubleshooting rápido

- `vite: not found` após subir o serviço: reconstruir a imagem do frontend e reiniciar o serviço:

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

- Se o backend reclamar de dependências PHP faltantes, pare os containers e reconstrua o backend (Dockerfile instala extensões necessárias):

```bash
docker compose build --no-cache backend
docker compose up -d backend
```

## Licença & contatos

Este repositório é mantido por você — atualize a seção de licença conforme necessário.

----

Se quiser, eu posso também adicionar um `docker-compose.override.yml` com configuração específica para desenvolvimento (ex.: mais volumes, debug) e um README mais detalhado por pasta (`backend/README.md` e `frontend/README.md`).
