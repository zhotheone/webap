/**
 * API Client for handling server requests
 * Supports both local development and production environments
 * Waits for authentication to be ready before making requests
 */

// Determine API base URL based on environment
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:10000/api';
    } 
    // GitHub Pages deployment
    else if (hostname === 'zhotheone.github.io') {
      return 'https://webapb.onrender.com/api';
    }
    // Fallback/production
    else {
      return 'https://webapb.onrender.com/api';
    }
  };
  
  // Initialize API client
  const apiClient = {
    // Base URL (determined dynamically based on environment)
    baseUrl: getApiBaseUrl(),
    
    /**
     * Get Telegram init data (for auth)
     * @returns {Promise<string|null>} - Telegram init data or null for local development
     */
    async getTelegramInitData() {
      // Wait for auth to be ready if the function exists
      if (window.waitForAuth) {
        await window.waitForAuth();
      }
      
      // If we're in Telegram webview and window.Telegram is available
      if (window.Telegram && window.Telegram.WebApp) {
        return window.Telegram.WebApp.initData;
      }
      
      // For local development, return mock data
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Using mock Telegram auth for local development');
        return 'mock_telegram_init_data';
      }
      
      return null;
    },
    
    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>} - Response data
     */
    async get(endpoint) {
      console.log(`API Request: GET ${this.baseUrl}${endpoint}`);
      
      try {
        // Wait for auth to be ready
        if (window.waitForAuth) {
          await window.waitForAuth();
        }
        
        // Prepare headers with auth data
        const headers = {
          'Accept': 'application/json'
        };
        
        // Add Telegram init data if available
        const telegramInitData = await this.getTelegramInitData();
        if (telegramInitData) {
          headers['X-Telegram-Init-Data'] = telegramInitData;
        }
        
        // Add user ID header which is more reliable
        if (window.currentUserId) {
          headers['X-User-ID'] = window.currentUserId;
        }
        
        // Make the request
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: headers,
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        console.log(`API Response status: ${response.status}`);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: await response.text() || response.statusText };
          }
          throw new Error(errorData?.error || `HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Request error:', error);
        throw error;
      }
    },
    
    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @returns {Promise<any>} - Response data
     */
    async post(endpoint, data = null) {
      try {
        // Wait for auth to be ready
        if (window.waitForAuth) {
          await window.waitForAuth();
        }
        
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'same-origin'
        };
        
        // Add Telegram init data if available
        const telegramInitData = await this.getTelegramInitData();
        if (telegramInitData) {
          options.headers['X-Telegram-Init-Data'] = telegramInitData;
        }
        
        // Add user ID header which is more reliable
        if (window.currentUserId) {
          options.headers['X-User-ID'] = window.currentUserId;
        }
        
        if (data) {
          options.body = JSON.stringify(data);
        }
        
        console.log(`Making POST request to: ${this.baseUrl}${endpoint}`, data);
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: await response.text() || response.statusText };
          }
          throw new Error(errorData?.error || `HTTP error ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    
    /**
     * Make a DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>} - Response data
     */
    async delete(endpoint) {
      console.log(`API Request: DELETE ${this.baseUrl}${endpoint}`);
      
      try {
        // Wait for auth to be ready
        if (window.waitForAuth) {
          await window.waitForAuth();
        }
        
        // Prepare headers with auth data
        const headers = {
          'Accept': 'application/json'
        };
        
        // Add Telegram init data if available
        const telegramInitData = await this.getTelegramInitData();
        if (telegramInitData) {
          headers['X-Telegram-Init-Data'] = telegramInitData;
        }
        
        // Add user ID header which is more reliable
        if (window.currentUserId) {
          headers['X-User-ID'] = window.currentUserId;
        }
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: headers,
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        console.log(`API Response status: ${response.status}`);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: await response.text() || response.statusText };
          }
          throw new Error(errorData?.error || `HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Request error:', error);
        throw error;
      }
    },
    
    /**
     * Make a PATCH request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @returns {Promise<any>} - Response data
     */
    async patch(endpoint, data = null) {
      try {
        // Wait for auth to be ready
        if (window.waitForAuth) {
          await window.waitForAuth();
        }
        
        const options = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'same-origin'
        };
        
        // Add Telegram init data if available
        const telegramInitData = await this.getTelegramInitData();
        if (telegramInitData) {
          options.headers['X-Telegram-Init-Data'] = telegramInitData;
        }
        
        // Add user ID header which is more reliable
        if (window.currentUserId) {
          options.headers['X-User-ID'] = window.currentUserId;
        }
        
        if (data) {
          options.body = JSON.stringify(data);
        }
        
        console.log(`Making PATCH request to: ${this.baseUrl}${endpoint}`, data);
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: await response.text() || response.statusText };
          }
          throw new Error(errorData?.error || `HTTP error ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    }
  };
  
  // Make apiClient available globally
  window.apiClient = apiClient;
  
  // Helper function to detect if we're running inside Telegram WebApp
  window.isTelegramWebApp = function() {
    return window.Telegram && window.Telegram.WebApp;
  };
  
  // Helper function to get user from Telegram if available
  window.getTelegramUser = function() {
    if (window.Telegram && window.Telegram.WebApp) {
      return window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
    }
    return null;
  };
  
  // Helper function to get telegram init data
  window.getTelegramInitData = function() {
    if (window.Telegram && window.Telegram.WebApp) {
      return window.Telegram.WebApp.initData;
    }
    return null;
  };
  
  console.log(`API Client initialized with base URL: ${apiClient.baseUrl}`);