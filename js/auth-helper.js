/**
 * Authentication Helper for Telegram Web App
 * - Handles Telegram WebApp authentication
 * - Provides mock data for local development
 * - Ensures user is initialized before app loads
 */

(function() {
    // Create a promise that will resolve when user auth is ready
    window.authReadyPromise = new Promise((resolve) => {
      window._resolveAuthReady = resolve;
    });
    
    // App environment detection
    window.appEnvironment = {
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      isGithubPages: window.location.hostname === 'zhotheone.github.io',
      isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    };
    
    // Parse Telegram Web App init data from URL
    function parseWebAppInitData() {
      try {
        // Check if we have tgWebAppData in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        let initData = urlParams.get('tgWebAppData');
        
        // If not in URL params, check hash
        if (!initData && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          initData = hashParams.get('tgWebAppData');
        }
        
        if (initData) {
          // Parse the data - in real implementation, this is url-encoded
          const decodedData = decodeURIComponent(initData);
          const params = {};
          
          decodedData.split('&').forEach(item => {
            const [key, value] = item.split('=');
            params[key] = decodeURIComponent(value);
          });
          
          // Extract user data
          if (params.user) {
            try {
              return JSON.parse(params.user);
            } catch (e) {
              console.error('Failed to parse user data:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing WebApp init data:', e);
      }
      return null;
    }
    
    // Check if script is within a Telegram WebApp environment
    function isTelegramWebApp() {
      // Most reliable check - if Telegram WebApp has already initialized
      if (window.Telegram && window.Telegram.WebApp) {
        return true;
      }
      
      // Check if the page was loaded with a WebApp init parameter
      if (window.location.search.includes('tgWebAppData=') || 
          window.location.search.includes('tgWebAppVersion=') ||
          window.location.hash.includes('tgWebAppData=')) {
        return true;
      }
      
      // Check for Telegram's WebApp script
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.includes('telegram-web-app.js')) {
          return true;
        }
      }
      
      return false;
    }
    
    // Extract user ID from various sources
    function extractUserId() {
      // First check the WebApp object if available
      if (window.Telegram && window.Telegram.WebApp && 
          window.Telegram.WebApp.initDataUnsafe && 
          window.Telegram.WebApp.initDataUnsafe.user) {
        
        return window.Telegram.WebApp.initDataUnsafe.user.id;
      }
      
      // Try to parse from URL parameters
      const userData = parseWebAppInitData();
      if (userData && userData.id) {
        return userData.id;
      }
      
      return null;
    }
    
    // Initialize userId - either from Telegram or generate mock for local development
    function initializeUserId() {
      const isInTelegram = isTelegramWebApp();
      window.isTelegramEnvironment = isInTelegram;
      
      // For local development, use stored ID or create a new one
      if (window.appEnvironment.isLocalhost) {
        let storedId = localStorage.getItem('userId');
        
        if (!storedId) {
          storedId = 'local_user_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('userId', storedId);
        }
        
        window.currentUserId = storedId;
        console.log('Using mock user ID for local development:', window.currentUserId);
        window._resolveAuthReady(window.currentUserId); // Resolve the auth promise for local dev
        return window.currentUserId;
      }
      
      // In Telegram WebApp environment
      if (isInTelegram) {
        console.log('Telegram WebApp environment detected');
        
        // First try to extract ID synchronously
        const userId = extractUserId();
        if (userId) {
          window.currentUserId = userId;
          console.log('Using Telegram user ID:', window.currentUserId);
          window._resolveAuthReady(window.currentUserId); // Resolve the auth promise
          return window.currentUserId;
        }
        
        console.log('Waiting for Telegram WebApp initialization...');
        window.currentUserId = null;
        
        // If WebApp script is not loaded yet, add the script
        if (!window.Telegram) {
          console.log('Adding Telegram WebApp script');
          const script = document.createElement('script');
          script.src = 'https://telegram.org/js/telegram-web-app.js';
          document.head.appendChild(script);
        }
        
        // Setup a listener for when Telegram WebApp becomes available
        const maxWaitTime = 5000; // 5 seconds max wait time
        const startTime = Date.now();
        
        const telegramInitInterval = setInterval(function() {
          // Try again to extract user ID
          const userId = extractUserId();
          
          if (userId) {
            window.currentUserId = userId;
            console.log('Telegram WebApp initialized, using user ID:', window.currentUserId);
            clearInterval(telegramInitInterval);
            window._resolveAuthReady(window.currentUserId); // Resolve the auth promise
            return;
          }
          
          // Check timeout
          if (Date.now() - startTime > maxWaitTime) {
            console.warn('Telegram WebApp initialization timed out, using fallback');
            clearInterval(telegramInitInterval);
            
            // Fallback when timeout - use a browser session ID
            window.currentUserId = 'telegram_user_' + Date.now();
            window._resolveAuthReady(window.currentUserId); // Resolve the auth promise with fallback ID
          }
        }, 100);
        
        return null; // We don't have the ID yet, but the interval will set it
      }
      
      // Fallback - not in Telegram and not localhost
      console.log('Not running in Telegram WebApp or local environment');
      window.currentUserId = localStorage.getItem('userId') || 'browser_user_' + Date.now();
      window._resolveAuthReady(window.currentUserId); // Resolve the auth promise
      return window.currentUserId;
    }
    
    // Configure Telegram WebApp or create mock
    function configureTelegramWebApp() {
      // If WebApp is already available, we're done
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp is ready');
        return;
      }
      
      // Create mock only for local development
      if (window.appEnvironment.isLocalhost) {
        console.log('Creating mock Telegram WebApp for local development');
        
        window.Telegram = {
          WebApp: {
            initData: 'mock_init_data_for_testing',
            initDataUnsafe: {
              user: {
                id: window.currentUserId,
                first_name: 'Local',
                last_name: 'User',
                username: 'localuser',
                language_code: 'en'
              }
            },
            HapticFeedback: {
              notificationOccurred: function(type) {
                console.log('Mock haptic feedback:', type);
              }
            },
            MainButton: {
              text: '',
              color: '',
              textColor: '',
              isVisible: false,
              setParams: function(params) {
                this.text = params.text || '';
                this.color = params.color || '';
                this.textColor = params.text_color || '';
                this.isVisible = params.is_visible || false;
                console.log('Mock MainButton params set:', params);
              },
              show: function() {
                this.isVisible = true;
                console.log('Mock MainButton shown');
              },
              hide: function() {
                this.isVisible = false;
                console.log('Mock MainButton hidden');
              }
            },
            expand: function() {
              console.log('Mock expand called');
            },
            openLink: function(url) {
              console.log('Mock openLink called with:', url);
              window.open(url, '_blank');
            },
            colorScheme: 'dark',
            viewportStableHeight: window.innerHeight
          }
        };
      }
    }
    
    // Initialize auth
    function initializeAuth() {
      // Set up user ID
      initializeUserId();
      
      // Configure Telegram WebApp or create mock
      configureTelegramWebApp();
    }
    
    // Initialize as soon as script loads
    initializeAuth();
    
    // Make helper functions available globally
    window.waitForAuth = function() {
      return window.authReadyPromise;
    };
    
    window.isTelegramWebApp = function() {
      return window.isTelegramEnvironment || 
             (window.Telegram && window.Telegram.WebApp);
    };
    
    window.getTelegramUser = function() {
      if (window.Telegram && window.Telegram.WebApp) {
        return window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
      }
      return null;
    };
    
    window.getTelegramInitData = function() {
      if (window.Telegram && window.Telegram.WebApp) {
        return window.Telegram.WebApp.initData;
      } else if (window.appEnvironment.isLocalhost) {
        return 'mock_init_data_for_testing';
      }
      return null;
    };
    
    console.log('Auth helper initialized');
  })();