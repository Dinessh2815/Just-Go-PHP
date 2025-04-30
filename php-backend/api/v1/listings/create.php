<?php
// api/v1/listings/create.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../../config/supabase.php';

try {
    // Get POST data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request data']);
        exit;
    }
    
    // Validate required fields
    $requiredFields = ['name', 'description', 'address', 'category_id', 'category_slug'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: {$field}"]);
            exit;
        }
    }
    
    // Add created_at timestamp
    $data['created_at'] = date('Y-m-d H:i:s');
    
    $client = SupabaseConfig::createClient();
    
    // Build the URL for listings table
    $url = $client->url . "/listings";
    
    // Set headers for returning the created object
    $headers = [
        "Prefer" => "return=representation"
    ];
    
    // Execute the POST request
    $response = $client->grab($url, 'POST', $data, $headers);
    $result = json_decode($response, true);
    
    // Return the created listing
    http_response_code(201);
    echo json_encode($result[0]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
