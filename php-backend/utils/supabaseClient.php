<?php
require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

return new Supabase\Functions(
    $_ENV['SB_URL'],
    $_ENV['SB_API_KEY']
);
?>
