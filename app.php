<?php 

require 'libs/DatabaseConnection.php';


function top5()
{
    $db = DatabaseConnection::getInstance();

    return $db->query(
        "SELECT * FROM musicas ORDER BY visualizacoes DESC LIMIT :limit",
        [':limit' => 5]
    );
}

function salvaMusica($dados)
{
    $db = DatabaseConnection::getInstance();

    try {

        return $db->insert('musicas', $dados);
    } catch (PDOException $e) {
        throw new Exception("Erro ao salvar no banco de dados: " . $e->getMessage());
    }
}

function formatarVisualizacoes($numero) {
    if ($numero >= 1000000000) {
        return number_format($numero / 1000000000, 1) . 'B';
    }
    if ($numero >= 1000000) {
        return number_format($numero / 1000000, 1) . 'M';
    }
    if ($numero >= 1000) {
        return number_format($numero / 1000, 1) . 'K';
    }
    return $numero;
}