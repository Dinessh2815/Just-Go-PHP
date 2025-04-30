<?php
// api/v1/listings/get.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../../config/supabase.php';

try {
    // Get ID from URL parameter
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }
    
    // Try to determine the category if not provided
    // For now, we'll need to check all tables
    $tables = ['hotels', 'restaurants', 'things_to_do', 'events'];
    $result = null;
    
    if ($category) {
        // If category is provided, only check that table
        switch ($category) {
            case 'hotels':
                $table = 'hotels';
                break;
            case 'restaurants':
                $table = 'restaurants';
                break;
            case 'things-to-do':
                $table = 'things_to_do';
                break;
            case 'events':
                $table = 'events';
                break;
            default:
                $table = null;
        }
        
        if ($table) {
            $tables = [$table];
        }
    }
    
    // Search for the item in all relevant tables
    foreach ($tables as $table) {
        $apiUrl = '/rest/v1/' . $table;
        $params = ['id' => 'eq.' . $id];
        
        $data = SupabaseConfig::request($apiUrl, 'GET', $params);
        
        if (!empty($data)) {
            $result = $data[0];
            break;
        }
    }
    
    if (!$result) {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
        exit;
    }
    
    // Return the found item
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
