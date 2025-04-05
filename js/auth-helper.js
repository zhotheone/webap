/**
 * Authentication Helper for Telegram Web App
 * - Handles Telegram WebApp authentication
 * - Provides mock data for local development
 */

(function() {
    // App environment detection
    window.appEnvironment = {
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      isGithubPages: window.location.hostname === 'zhotheone.github.io',
      isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    };
    
    // Check if script is within a Telegram WebApp environment
    function isTelegramWebApp() {
      // More robust check - window.Telegram might be initialized but WebApp might not be ready yet
      if (window.Telegram) {
        // If Telegram exists, most likely it's the WebApp
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
    
    // Initialize userId - either from Telegram or generate mock for local development
    function initializeUserId() {
      // For local development, use stored ID or create a new one
      if (window.appEnvironment.isLocalhost) {
        // Try to retrieve from localStorage first
        let storedId = localStorage.getItem('userId');
        
        if (!storedId) {
          // Generate a deterministic ID for local testing
          storedId = 'local_user_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('userId', storedId);
        }
        
        window.currentUserId = storedId;
        console.log('Using mock user ID for local development:', window.currentUserId);
        return window.currentUserId;
      }
      
      // Detect if we're in a Telegram WebApp environment
      const isTelegramEnv = isTelegramWebApp();
      
      if (isTelegramEnv) {
        // Even if the WebApp object isn't fully available yet, 
        // we'll note that we're in Telegram and wait for it to be ready
        window.isTelegramEnvironment = true;
        console.log('Telegram WebApp environment detected, waiting for initialization...');
        
        // If WebApp is already available, get the user ID
        if (window.Telegram && window.Telegram.WebApp && 
            window.Telegram.WebApp.initDataUnsafe && 
            window.Telegram.WebApp.initDataUnsafe.user) {
          
          const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
          window.currentUserId = telegramUser.id;
          console.log('Using Telegram user ID:', window.currentUserId);
        } else {
          // Temporary ID until Telegram WebApp is ready
          window.currentUserId = 'telegram_user_initializing';
          
          // Setup a listener for when Telegram WebApp becomes available
          const telegramInitInterval = setInterval(function() {
            if (window.Telegram && window.Telegram.WebApp && 
                window.Telegram.WebApp.initDataUnsafe && 
                window.Telegram.WebApp.initDataUnsafe.user) {
              
              const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
              window.currentUserId = telegramUser.id;
              console.log('Telegram WebApp initialized, using user ID:', window.currentUserId);
              
              // Only try to redisplay user info if function exists
              if (typeof window.displayUserInfo === 'function') {
                window.displayUserInfo();
              }
              
              clearInterval(telegramInitInterval);
            }
          }, 100);
        }
        
        return window.currentUserId;
      }
      
      // Fallback - not in Telegram and not localhost
      window.currentUserId = localStorage.getItem('userId') || 'user_' + Date.now();
      return window.currentUserId;
    }
    
    // Initialize auth
    function initializeAuth() {
      // Set up user ID
      initializeUserId();
      
      // If in a known Telegram environment but WebApp isn't ready,
      // skip mock creation - we'll wait for the real one
      if (window.isTelegramEnvironment) {
        return;
      }
      
      // If WebApp is already available, configure it
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp detected and ready');
        // We'll let the main.js handle detailed configuration
      } 
      // Create mock only for local development
      else if (window.appEnvironment.isLocalhost) {
        // Mock Telegram WebApp object for local testing
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
            colorScheme: 'dark',
            viewportStableHeight: window.innerHeight
          }
        };
      }
    }
    
    // Initialize as soon as script loads
    initializeAuth();
    
    // Make helper functions available globally
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