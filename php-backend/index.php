<?php
// Root index.php to handle requests to the PHP server root
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Return a welcome message with API information
echo json_encode([
    'status' => 'online',
    'message' => 'Just-Go API Server',
    'version' => 'v1',
    'endpoints' => [
        'listings' => '/api/v1/listings',
        'single_listing' => '/api/v1/listings/{id}',
    ],
    'documentation' => 'See DEPLOYMENT.md for API documentation'
]);
?>