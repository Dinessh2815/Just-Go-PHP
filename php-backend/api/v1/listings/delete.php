<?php
// api/v1/listings/delete.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
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
    
    $client = SupabaseConfig::createClient();
    
    // Build the URL for listings table
    $url = $client->url . "/listings";
    
    // Add query parameter for ID
    $params = [
        'id' => "eq.{$id}" 
    ];
    
    // First check if the listing exists
    $checkResponse = $client->grab($url, 'GET', $params);
    $existingListing = json_decode($checkResponse, true);
    
    if (empty($existingListing)) {
        http_response_code(404);
        echo json_encode(['error' => 'Listing not found']);
        exit;
    }
    
    // Set headers for returning the deleted object
    $headers = [
        "Prefer" => "return=representation"
    ];
    
    // Execute the DELETE request
    $response = $client->grab($url, 'DELETE', null, $headers, $params);
    
    // Return success message
    http_response_code(200);
    echo json_encode([
        'message' => 'Listing deleted successfully',
        'id' => $id
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
