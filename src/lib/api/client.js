/**
 * API Client for fetching data from the PHP backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  /**
   * Get all listings with filtering options
   * @param {Object} options - Filter options
   * @param {string} options.category - Filter by category (hotels, restaurants, things-to-do, events)
   * @param {string} options.search - Search term
   * @param {string} options.sort - Sort field
   * @param {string} options.order - Sort order (asc, desc)
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Response with data and pagination info
   */
  static async getListings(options = {}) {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      const response = await fetch(`${API_URL}/listings${queryString}`);
      
      // Check if response is ok
      if (!response.ok) {
        // Improved error handling for non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        } else {
          // Handle non-JSON error responses
          const text = await response.text();
          throw new Error(`API error: ${response.status}. ${text.substring(0, 100)}...`);
        }
      }
      
      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format. Expected JSON.');
      }
      
      // Parse JSON response
      const data = await response.json();
      return {
        data: data.data || [],
        count: data.count || 0,
        page: data.page || 1,
        limit: data.limit || 10
      };
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Return empty data to prevent rendering errors
      return {
        data: [],
        count: 0,
        page: 1,
        limit: 10,
        error: error.message
      };
    }
  }
  
  /**
   * Get a single listing by ID
   * @param {string|number} id - Listing ID
   * @returns {Promise<Object>} Listing data
   */
  static async getListing(id) {
    try {
      const response = await fetch(`${API_URL}/listings/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch listing with ID ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching listing ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new listing
   * @param {Object} data - Listing data
   * @returns {Promise<Object>} Created listing data
   */
  static async createListing(data) {
    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing listing
   * @param {string|number} id - Listing ID
   * @param {Object} data - Updated listing data
   * @returns {Promise<Object>} Updated listing data
   */
  static async updateListing(id, data) {
    try {
      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update listing with ID ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating listing ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a listing
   * @param {string|number} id - Listing ID
   * @returns {Promise<Object>} Delete result with message
   */
  static async deleteListing(id) {
    try {
      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete listing with ID ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error deleting listing ${id}:`, error);
      throw error;
    }
  }
}

export default ApiClient;