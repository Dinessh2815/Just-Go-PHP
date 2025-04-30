<?php
require_once __DIR__ . '/../../vendor/autoload.php';

class SupabaseConfig {
    public static function createClient() {
        // Load environment variables from .env file
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->load();
        
        // Get Supabase credentials from environment
        $supabaseUrl = $_ENV['SB_URL'];
        $supabaseKey = $_ENV['SB_API_KEY'];
        
        if (empty($supabaseUrl) || empty($supabaseKey)) {
            throw new Exception('Supabase credentials not found in environment');
        }
        
        return [
            'url' => $supabaseUrl,
            'key' => $supabaseKey
        ];
    }
    
    /**
     * Helper function to perform Supabase API requests
     */
    public static function request($url, $method = 'GET', $params = [], $data = null) {
        $config = self::createClient();
        $baseUrl = $config['url'];
        $apiKey = $config['key'];
        
        // Build full URL with query parameters
        $fullUrl = $baseUrl . $url;
        if (!empty($params) && $method === 'GET') {
            $fullUrl .= '?' . http_build_query($params);
        }
        
        // Initialize cURL session
        $curl = curl_init($fullUrl);
        
        // Set common options
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'apikey: ' . $apiKey,
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
                'Prefer: return=representation'
            ]
        ]);
        
        // Set method-specific options
        switch ($method) {
            case 'POST':
                curl_setopt($curl, CURLOPT_POST, true);
                if ($data) {
                    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'PATCH':
            case 'PUT':
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
                if ($data) {
                    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'DELETE':
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
        }
        
        // Execute request
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        // Check for cURL errors
        if (curl_errno($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception('cURL Error: ' . $error);
        }
        
        curl_close($curl);
        
        // Handle response based on HTTP status code
        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        } else {
            throw new Exception('Supabase API Error (' . $httpCode . '): ' . $response);
        }
    }
}
?>
