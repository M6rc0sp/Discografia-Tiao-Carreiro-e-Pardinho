<?php

class DatabaseConnection
{
    private static $instance = null;
    private $connection = null;
    private $dbPath = __DIR__ . '/database.sqlite';

    /**
     * Construtor privado para garantir singleton
     */
    private function __construct()
    {
        try {
            $dbExists = file_exists($this->dbPath);

            // Cria o diretório se não existir
            $dbDir = dirname($this->dbPath);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }

            // Estabelece a conexão usando PDO
            $this->connection = new PDO("sqlite:{$this->dbPath}");

            // Configura o PDO para lançar exceções em caso de erro
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Habilita foreign keys
            $this->connection->exec('PRAGMA foreign_keys = ON');
            $this->connection->exec('PRAGMA journal_mode = WAL');

            // Se o banco não existia, inicializa a estrutura e os dados
            if (!$dbExists) {
                $this->initializeDatabase();
            }
        } catch (PDOException $e) {
            throw new Exception("Erro ao conectar ao banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Inicializa o banco de dados com a estrutura e dados iniciais
     */
    private function initializeDatabase(): void
    {
        try {
            // Criação da tabela
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS musicas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    visualizacoes INTEGER NOT NULL,
                    youtube_id TEXT NOT NULL,
                    thumb TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Dados iniciais
            $initialData = [
                [
                    'titulo' => 'O Mineiro e o Italiano',
                    'visualizacoes' => 5200000,
                    'youtube_id' => 's9kVG2ZaTS4',
                    'thumb' => 'https://img.youtube.com/vi/s9kVG2ZaTS4/hqdefault.jpg'
                ],
                [
                    'titulo' => 'Pagode em Brasília',
                    'visualizacoes' => 5000000,
                    'youtube_id' => 'lpGGNA6_920',
                    'thumb' => 'https://img.youtube.com/vi/lpGGNA6_920/hqdefault.jpg'
                ],
                [
                    'titulo' => 'Rio de Lágrimas',
                    'visualizacoes' => 153000,
                    'youtube_id' => 'FxXXvPL3JIg',
                    'thumb' => 'https://img.youtube.com/vi/FxXXvPL3JIg/hqdefault.jpg'
                ],
                [
                    'titulo' => 'Tristeza do Jeca',
                    'visualizacoes' => 154000,
                    'youtube_id' => 'tRQ2PWlCcZk',
                    'thumb' => 'https://img.youtube.com/vi/tRQ2PWlCcZk/hqdefault.jpg'
                ],
                [
                    'titulo' => 'Terra roxa',
                    'visualizacoes' => 3300000,
                    'youtube_id' => '4Nb89GFu2g4',
                    'thumb' => 'https://img.youtube.com/vi/4Nb89GFu2g4/hqdefault.jpg'
                ]
            ];

            // Inicia uma transação para inserir todos os dados
            $this->beginTransaction();

            $stmt = $this->connection->prepare("
                INSERT INTO musicas (titulo, visualizacoes, youtube_id, thumb)
                VALUES (:titulo, :visualizacoes, :youtube_id, :thumb)
            ");

            foreach ($initialData as $musica) {
                $stmt->execute([
                    ':titulo' => $musica['titulo'],
                    ':visualizacoes' => $musica['visualizacoes'],
                    ':youtube_id' => $musica['youtube_id'],
                    ':thumb' => $musica['thumb']
                ]);
            }

            $this->commit();
        } catch (PDOException $e) {
            $this->rollback();
            throw new Exception("Erro ao inicializar banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Obtém a instância única da conexão (Singleton)
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Executa uma consulta SQL e retorna o resultado
     */
    public function query(string $sql, array $params = []): array|bool
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);

            // Se for um SELECT, retorna os resultados
            if (stripos($sql, 'SELECT') === 0) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            return true;
        } catch (PDOException $e) {
            throw new Exception("Erro ao executar query: " . $e->getMessage());
        }
    }

    /**
     * Insere um novo registro na tabela especificada
     * 
     * @param string $table Nome da tabela
     * @param array $data Array associativo com os dados a serem inseridos
     * @return bool|string Retorna o ID do registro inserido em caso de sucesso, ou false em caso de erro
     * @throws Exception Se houver erro na execução da query
     */
    public function insert(string $table, array $data): bool|string
    {
        try {
            // Verifica se há dados para inserir
            if (empty($data)) {
                throw new Exception("Dados vazios para inserção");
            }

            // Prepara as colunas e valores para o INSERT
            $columns = array_keys($data);
            $placeholders = array_map(function ($item) {
                return ":$item";
            }, $columns);

            // Monta a query INSERT
            $sql = sprintf(
                "INSERT INTO %s (%s) VALUES (%s)",
                $table,
                implode(', ', $columns),
                implode(', ', $placeholders)
            );

            // Prepara os parâmetros para bind
            $params = array_combine(
                array_map(function ($item) {
                    return ":$item";
                }, array_keys($data)),
                array_values($data)
            );

            // Executa a query
            $stmt = $this->connection->prepare($sql);
            $result = $stmt->execute($params);

            // Se a inserção foi bem sucedida, retorna o ID do último registro
            if ($result) {
                return $this->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            throw new Exception("Erro ao inserir registro: " . $e->getMessage());
        }
    }

    /**
     * Obtém o ID do último registro inserido
     */
    public function lastInsertId(): string
    {
        return $this->connection->lastInsertId();
    }

    /**
     * Inicia uma transação
     */
    public function beginTransaction(): bool
    {
        return $this->connection->beginTransaction();
    }

    /**
     * Confirma uma transação
     */
    public function commit(): bool
    {
        return $this->connection->commit();
    }

    /**
     * Reverte uma transação
     */
    public function rollback(): bool
    {
        return $this->connection->rollback();
    }

    /**
     * Fecha a conexão
     */
    public function close(): void
    {
        $this->connection = null;
    }

    /**
     * Destrutor para garantir que a conexão seja fechada
     */
    public function __destruct()
    {
        $this->close();
    }
}
