<?php

require '../app.php';

session_start();

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 */
function extractVideoId($url)
{
    $videoId = null;

    // Padrões de URL do YouTube
    $patterns = [
        '/youtube\.com\/watch\?v=([^&]+)/', // youtube.com/watch?v=ID
        '/youtu\.be\/([^?]+)/',            // youtu.be/ID
        '/youtube\.com\/embed\/([^?]+)/',   // youtube.com/embed/ID
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            $videoId = $matches[1];
            break;
        }
    }

    return $videoId;
}

/**
 * Busca informações do vídeo usando web scraping
 */
function getVideoInfo($videoId)
{
    $url = "https://www.youtube.com/watch?v=" . $videoId;

    // Inicializa o cURL
    $ch = curl_init();

    // Configura o cURL para a requisição
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]);

    // Faz a requisição
    $response = curl_exec($ch);

    if ($response === false) {
        throw new Exception("Erro ao acessar o YouTube: " . curl_error($ch));
    }

    curl_close($ch);

    // Extrai o título
    if (!preg_match('/<title>(.+?) - YouTube<\/title>/', $response, $titleMatches)) {
        throw new Exception("Não foi possível encontrar o título do vídeo");
    }
    $title = html_entity_decode($titleMatches[1], ENT_QUOTES);

    // Extrai as visualizações
    // Procura pelo padrão de visualizações no JSON dos dados do vídeo
    if (preg_match('/"viewCount":\s*"(\d+)"/', $response, $viewMatches)) {
        $views = (int)$viewMatches[1];
    } else {
        // Tenta um padrão alternativo
        if (preg_match('/\"viewCount\"\s*:\s*{.*?\"simpleText\"\s*:\s*\"([\d,\.]+)\"/', $response, $viewMatches)) {
            $views = (int)str_replace(['.', ','], '', $viewMatches[1]);
        } else {
            $views = 0;
        }
    }

    if ($title === '') {
        throw new Exception("Vídeo não encontrado ou indisponível");
    }

    return [
        'titulo' => $title,
        'visualizacoes' => $views,
        'youtube_id' => $videoId,
        'thumb' => 'https://img.youtube.com/vi/'.$videoId.'/hqdefault.jpg'
    ];
}


// Função para debug
function dd($data)
{
    echo '<pre>';
    var_dump($data);
    echo '</pre>';
    die();
}

// Processa a requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    try {
        // Obtém a URL do formulário
        $url = filter_input(INPUT_POST, 'url', FILTER_SANITIZE_URL);
        if (!$url) {
            throw new Exception("URL não fornecida");
        }

        // Extrai o ID do vídeo
        $videoId = extractVideoId($url);
        if (!$videoId) {
            throw new Exception("URL do YouTube inválida");
        }

        // Busca informações do vídeo
        $videoInfo = getVideoInfo($videoId);

        // Para debug: mostra as informações obtidas
        //dd($videoInfo);

        // Salva no banco de dados
        salvaMusica($videoInfo);

        // Define mensagem de sucesso
        $_SESSION['message'] = "Vídeo cadastrado com sucesso!";
        $_SESSION['message_type'] = "success";
    } catch (Exception $e) {
        // Define mensagem de erro
        $_SESSION['message'] = $e->getMessage();
        $_SESSION['message_type'] = "error";
    }

    // Redireciona de volta para a página inicial
    header("Location: index.php");
    exit;
}
