Backend (Laravel 11) - instruções rápidas

Este diretório contém um bootstrap para iniciar um projeto Laravel 11 dentro de um container Docker. O script `bootstrap.sh` criará o projeto Laravel (se ainda não existir), instalará dependências, criará o DB SQLite e iniciará o servidor embutido.

Como usar (requer Docker):

1. Na raiz do repositório, rode:

   docker-compose up --build

2. O backend ficará disponível em http://localhost:8000

Notas:
- O script cria o projeto Laravel automaticamente na primeira execução. Isso exige acesso à Internet para baixar pacotes via composer.
- Use SQLite por simplicidade; para produção prefira MySQL/Postgres.
- Autenticação sugerida: Laravel Sanctum (não instalada automaticamente neste scaffold). Veja o README raiz para próximos passos.
