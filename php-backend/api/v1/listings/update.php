<?php
// api/v1/listings/update.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../../config/supabase.php';

try {
    // Get ID from URL parameter
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Listing ID is required']);
        exit;
    }
    
    // Get PUT/PATCH data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || empty($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'No update data provided']);
        exit;
    }
    
    // Add updated_at timestamp
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    $client = SupabaseConfig::createClient();
    
    // Build the URL for listings table
    $url = $client->url . "/listings";
    
    // Add query parameter for ID
    $params = [
        'id' => "eq.{$id}" 
    ];
    
    // Set headers for returning the updated object
    $headers = [
        "Prefer" => "return=representation"
    ];
    
    // Execute the PATCH request
    $response = $client->grab($url, 'PATCH', $data, $headers, $params);
    $result = json_decode($response, true);
    
    // Check if the listing exists
    if (empty($result)) {
        http_response_code(404);
        echo json_encode(['error' => 'Listing not found']);
        exit;
    }
    
    // Return the updated listing
    echo json_encode($result[0]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
