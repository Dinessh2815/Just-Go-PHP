# Just-Go PHP API Deployment Guide

This document provides instructions for deploying the Just-Go PHP backend API that connects to Supabase.

## Requirements

### PHP Server Requirements

- PHP 8.1 or later
- Composer
- Apache with mod_rewrite enabled (for .htaccess routing) or Nginx
- Required PHP extensions:
  - curl
  - json
  - mbstring
  - openssl

### Required Packages

- supabase-php/supabase-client: For connecting to Supabase
- vlucas/phpdotenv: For environment variable management

## Environment Setup

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Just-Go-main
   ```

2. **Install PHP dependencies**

   ```bash
   cd php-backend
   composer install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `php-backend` directory with the following variables:

   ```
   SB_URL=your_supabase_url
   SB_API_KEY=your_supabase_api_key
   ```

4. **Start the PHP server**

   For local development, you can use PHP's built-in server:

   ```bash
   php -S localhost:8000 -t php-backend
   ```

   Or configure a local Apache/Nginx server to point to the php-backend folder.

### Production Deployment

1. **Server configuration**

   - Deploy the `php-backend` directory to your production server
   - Ensure the web server is configured to serve the API from the correct path
   - Make sure `.htaccess` files are enabled in your Apache configuration

2. **Environment variables**

   Set up environment variables on your production server:

   - For Apache: Use SetEnv directives in your Apache configuration or .htaccess
   - For Nginx: Use fastcgi_param directives in your server block

   Example for Apache virtual host:

   ```apache
   <VirtualHost *:80>
       ServerName api.your-domain.com
       DocumentRoot /path/to/php-backend
       
       <Directory /path/to/php-backend>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       SetEnv SB_URL your_supabase_url
       SetEnv SB_API_KEY your_supabase_api_key
   </VirtualHost>
   ```

3. **Folder permissions**

   Ensure proper permissions are set:

   ```bash
   chmod -R 755 /path/to/php-backend
   chown -R www-data:www-data /path/to/php-backend  # Use the appropriate web server user
   ```

## CORS Configuration

CORS headers are already set in the PHP API endpoints, but you may need to adjust them based on your frontend domain:

1. **Default configuration (already implemented)**

   The API allows requests from any origin with:

   ```php
   header("Access-Control-Allow-Origin: *");
   header("Content-Type: application/json; charset=UTF-8");
   header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
   header("Access-Control-Allow-Headers: Content-Type, Authorization");
   ```

2. **Restricting to specific domains**

   For production, you should restrict CORS to your frontend domain:

   ```php
   header("Access-Control-Allow-Origin: https://your-frontend-domain.com");
   ```

   You can modify this in each endpoint file in the `php-backend/api/v1/listings/` directory.

## Next.js Frontend Configuration

1. **Update environment variables**

   In your Next.js `.env.local` or environment configuration:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # For local development
   # Or for production:
   NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
   ```

2. **Build and deploy the frontend**

   ```bash
   npm run build
   npm start
   ```

## Testing the Deployment

After deploying both the PHP backend and Next.js frontend:

1. Navigate to your frontend URL
2. Verify that listings are being displayed correctly
3. Check that individual listing details load properly
4. Test filtering and searching functionality

## Troubleshooting

- **API returns 404 errors**: Check your .htaccess file and make sure mod_rewrite is enabled
- **CORS errors**: Verify that your PHP API is returning the correct CORS headers
- **Database connection errors**: Check your Supabase URL and API key in the environment variables
- **PHP errors**: Check your server error logs (usually in /var/log/apache2/error.log or similar)