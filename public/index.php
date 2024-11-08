<?php
require '../app.php';
session_start();
$top5 = top5();
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Top 5 Músicas - Tião Carreiro</title>
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <header>
        <img src="/tiao-carreiro-pardinho.png" alt="Tião Carreiro" class="artist-img" />
        <h1>Top 5 Músicas Mais Tocadas</h1>
        <h2>Tião Carreiro & Pardinho</h2>
    </header>

    <div class="container">
        <div class="submit-form">
            <h3>Sugerir Nova Música</h3>

            <?php if (isset($_SESSION['message'])): ?>
                <div class="message <?php echo $_SESSION['message_type']; ?>">
                    <?php
                    echo $_SESSION['message'];
                    unset($_SESSION['message']);
                    unset($_SESSION['message_type']);
                    ?>
                </div>
            <?php endif; ?>

            <form action="sugerir.php" method="POST">
                <div class="input-group">
                    <input type="url" name="url" placeholder="Cole aqui o link do YouTube" required>
                    <button type="submit" class="submit-button">Enviar Link</button>
                </div>
            </form>
        </div>

        <h3 class="section-title">Ranking Atual</h3>

        <?php if (empty($top5)) { ?>
            <div class="empty-state">
                <div class="empty-state-icon">🎵</div>
                <div class="empty-state-text">Nenhuma música cadastrada ainda</div>
                <div class="empty-state-subtext">Seja o primeiro a sugerir uma música usando o formulário acima!</div>
            </div>
        <?php } ?>

        <?php foreach ($top5 as $key => $item) { ?>
            <a href="https://www.youtube.com/watch?v=<?php echo $item['youtube_id'] ?>"
                target="_blank"
                rel="noopener noreferrer"
                class="music-card-link">
                <div class="music-card">
                    <div class="rank"><?php echo $key + 1 ?></div>
                    <div class="music-info">
                        <div class="music-title"><?php echo $item['titulo'] ?></div>
                        <div class="views"><?php echo formatarVisualizacoes($item['visualizacoes']) ?> visualizações</div>
                    </div>
                    <img src="<?php echo $item['thumb'] ?>" alt="Thumbnail <?php echo $item['titulo'] ?>" class="thumbnail" />
                </div>
            </a>
        <?php } ?>


    </div>
</body>

</html>