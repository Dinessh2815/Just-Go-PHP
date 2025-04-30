<?php
// api/v1/listings/index.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../../config/supabase.php';

try {
    // Get filter parameters
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $sort = $_GET['sort'] ?? 'created_at';
    $order = $_GET['order'] ?? 'desc';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    // Calculate offset for pagination
    $offset = ($page - 1) * $limit;
    
    // For now, let's use a simplified approach with mock data representing real data
    // This will give us consistent results while we debug
    
    // We'll create more mock items to simulate having multiple records per category
    $mockData = [];
    
    // Create mock hotel data (5 items as you mentioned)
    if (!$category || $category === 'hotels') {
        $mockData = array_merge($mockData, [
            [
                'id' => 1,
                'name' => 'Grand Hotel',
                'description' => 'Luxury hotel in downtown',
                'image_url' => '/placeholder-hotel.png',
                'location' => 'New York',
                'price_range' => 3,
                'category_slug' => 'hotels',
                'created_at' => '2025-04-01'
            ],
            [
                'id' => 2,
                'name' => 'Seaside Resort',
                'description' => 'Beachfront accommodation with stunning views',
                'image_url' => '/placeholder-hotel.png',
                'location' => 'Miami',
                'price_range' => 4,
                'category_slug' => 'hotels',
                'created_at' => '2025-04-02'
            ],
            [
                'id' => 3,
                'name' => 'Mountain Lodge',
                'description' => 'Cozy retreat in the mountains',
                'image_url' => '/placeholder-hotel.png',
                'location' => 'Denver',
                'price_range' => 2,
                'category_slug' => 'hotels',
                'created_at' => '2025-04-03'
            ],
            [
                'id' => 4,
                'name' => 'City Center Inn',
                'description' => 'Affordable accommodation in the heart of the city',
                'image_url' => '/placeholder-hotel.png',
                'location' => 'Chicago',
                'price_range' => 2,
                'category_slug' => 'hotels',
                'created_at' => '2025-04-04'
            ],
            [
                'id' => 5,
                'name' => 'Luxury Suites',
                'description' => 'Five-star luxury experience',
                'image_url' => '/placeholder-hotel.png',
                'location' => 'Los Angeles',
                'price_range' => 5,
                'category_slug' => 'hotels',
                'created_at' => '2025-04-05'
            ]
        ]);
    }
    
    // Create mock restaurant data (5 items)
    if (!$category || $category === 'restaurants') {
        $mockData = array_merge($mockData, [
            [
                'id' => 6,
                'name' => 'Italian Bistro',
                'description' => 'Authentic Italian cuisine',
                'image_url' => '/placeholder-restaurant.png',
                'location' => 'Boston',
                'cuisine_type' => 'Italian',
                'price_range' => 3,
                'category_slug' => 'restaurants',
                'created_at' => '2025-04-01'
            ],
            [
                'id' => 7,
                'name' => 'Sushi Paradise',
                'description' => 'Fresh sushi and Japanese dishes',
                'image_url' => '/placeholder-restaurant.png',
                'location' => 'Seattle',
                'cuisine_type' => 'Japanese',
                'price_range' => 4,
                'category_slug' => 'restaurants',
                'created_at' => '2025-04-02'
            ],
            [
                'id' => 8,
                'name' => 'Taco Town',
                'description' => 'Authentic Mexican street food',
                'image_url' => '/placeholder-restaurant.png',
                'location' => 'San Diego',
                'cuisine_type' => 'Mexican',
                'price_range' => 2,
                'category_slug' => 'restaurants',
                'created_at' => '2025-04-03'
            ],
            [
                'id' => 9,
                'name' => 'Burger Joint',
                'description' => 'Classic American burgers and fries',
                'image_url' => '/placeholder-restaurant.png',
                'location' => 'Austin',
                'cuisine_type' => 'American',
                'price_range' => 2,
                'category_slug' => 'restaurants',
                'created_at' => '2025-04-04'
            ],
            [
                'id' => 10,
                'name' => 'Curry House',
                'description' => 'Authentic Indian cuisine',
                'image_url' => '/placeholder-restaurant.png',
                'location' => 'Washington DC',
                'cuisine_type' => 'Indian',
                'price_range' => 3,
                'category_slug' => 'restaurants',
                'created_at' => '2025-04-05'
            ]
        ]);
    }
    
    // Create mock things to do data (5 items)
    if (!$category || $category === 'things-to-do') {
        $mockData = array_merge($mockData, [
            [
                'id' => 11,
                'name' => 'City Museum',
                'description' => 'Interactive exhibits and historical artifacts',
                'image_url' => '/placeholder.png',
                'location' => 'St. Louis',
                'activity_type' => 'Museum',
                'price_range' => 2,
                'duration' => '3-4 hours',
                'category_slug' => 'things-to-do',
                'created_at' => '2025-04-01'
            ],
            [
                'id' => 12,
                'name' => 'Adventure Park',
                'description' => 'Outdoor activities and zip lines',
                'image_url' => '/placeholder.png',
                'location' => 'Portland',
                'activity_type' => 'Outdoor',
                'price_range' => 3,
                'duration' => '4-6 hours',
                'category_slug' => 'things-to-do',
                'created_at' => '2025-04-02'
            ],
            [
                'id' => 13,
                'name' => 'Art Gallery',
                'description' => 'Contemporary art exhibitions',
                'image_url' => '/placeholder.png',
                'location' => 'San Francisco',
                'activity_type' => 'Arts',
                'price_range' => 1,
                'duration' => '1-2 hours',
                'category_slug' => 'things-to-do',
                'created_at' => '2025-04-03'
            ],
            [
                'id' => 14,
                'name' => 'Wildlife Safari',
                'description' => 'See exotic animals in their habitat',
                'image_url' => '/placeholder.png',
                'location' => 'Orlando',
                'activity_type' => 'Wildlife',
                'price_range' => 4,
                'duration' => 'All day',
                'category_slug' => 'things-to-do',
                'created_at' => '2025-04-04'
            ],
            [
                'id' => 15,
                'name' => 'Historic Walking Tour',
                'description' => 'Guided tour of historic landmarks',
                'image_url' => '/placeholder.png',
                'location' => 'Philadelphia',
                'activity_type' => 'Tour',
                'price_range' => 2,
                'duration' => '2-3 hours',
                'category_slug' => 'things-to-do',
                'created_at' => '2025-04-05'
            ]
        ]);
    }
    
    // Create mock events data (5 items)
    if (!$category || $category === 'events') {
        $mockData = array_merge($mockData, [
            [
                'id' => 16,
                'name' => 'Summer Music Festival',
                'description' => 'Annual outdoor music festival',
                'image_url' => '/placeholder.png',
                'location' => 'Nashville',
                'event_date' => '2025-06-15',
                'start_time' => '12:00 PM',
                'duration' => 'All day',
                'category' => 'Music',
                'price_range' => 3,
                'category_slug' => 'events',
                'created_at' => '2025-04-01'
            ],
            [
                'id' => 17,
                'name' => 'Food & Wine Expo',
                'description' => 'Tastings from local restaurants and wineries',
                'image_url' => '/placeholder.png',
                'location' => 'Napa Valley',
                'event_date' => '2025-07-22',
                'start_time' => '6:00 PM',
                'duration' => '3 hours',
                'category' => 'Food',
                'price_range' => 4,
                'category_slug' => 'events',
                'created_at' => '2025-04-02'
            ],
            [
                'id' => 18,
                'name' => 'Tech Conference',
                'description' => 'Latest innovations and networking',
                'image_url' => '/placeholder.png',
                'location' => 'San Jose',
                'event_date' => '2025-08-05',
                'start_time' => '9:00 AM',
                'duration' => '2 days',
                'category' => 'Technology',
                'price_range' => 3,
                'category_slug' => 'events',
                'created_at' => '2025-04-03'
            ],
            [
                'id' => 19,
                'name' => 'Comedy Night',
                'description' => 'Stand-up performances by local comedians',
                'image_url' => '/placeholder.png',
                'location' => 'Atlanta',
                'event_date' => '2025-05-12',
                'start_time' => '8:00 PM',
                'duration' => '2 hours',
                'category' => 'Entertainment',
                'price_range' => 2,
                'category_slug' => 'events',
                'created_at' => '2025-04-04'
            ],
            [
                'id' => 20,
                'name' => 'Art Exhibition Opening',
                'description' => 'Opening night of a new art collection',
                'image_url' => '/placeholder.png',
                'location' => 'New York',
                'event_date' => '2025-05-30',
                'start_time' => '7:00 PM',
                'duration' => '3 hours',
                'category' => 'Arts',
                'price_range' => 1,
                'category_slug' => 'events',
                'created_at' => '2025-04-05'
            ]
        ]);
    }
    
    // Filter by category if specified
    if ($category) {
        $mockData = array_filter($mockData, function($item) use ($category) {
            return $item['category_slug'] === $category;
        });
        // Reset array keys
        $mockData = array_values($mockData);
    }
    
    // Search functionality
    if ($search) {
        $mockData = array_filter($mockData, function($item) use ($search) {
            return stripos($item['name'], $search) !== false || 
                  stripos($item['location'], $search) !== false;
        });
        // Reset array keys
        $mockData = array_values($mockData);
    }
    
    // Sort the data
    usort($mockData, function($a, $b) use ($sort, $order) {
        if ($order === 'asc') {
            return $a[$sort] <=> $b[$sort];
        } else {
            return $b[$sort] <=> $a[$sort];
        }
    });
    
    // Apply pagination
    $totalCount = count($mockData);
    $mockData = array_slice($mockData, $offset, $limit);
    
    // Return the listings
    echo json_encode([
        'data' => $mockData,
        'count' => $totalCount,
        'page' => $page,
        'limit' => $limit
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
