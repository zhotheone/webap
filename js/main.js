// filepath: main.js
/**
 * Main JavaScript file
 * Initializes all components and UI effects
 * Waits for authentication to be ready before loading
 */

// Function to initialize the application
async function initializeApplication() {
    console.log('Waiting for authentication to be ready...');
    
    try {
        // Wait for authentication to be ready
        if (window.waitForAuth) {
            await window.waitForAuth();
        }
        
        console.log('Authentication ready, initializing application with user ID:', window.currentUserId);
        
        // Check if we're running in Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            console.log('Running in Telegram WebApp environment');
            // Set up Telegram-specific behavior
            setupTelegramWebApp();
        } else {
            console.log('Running in browser environment');
        }
        
        // Display user information
        displayUserInfo();
        
        // Initialize tab navigation
        initTabNavigation();
        
        // Initialize media navigation
        initMediaNavigation();
        
        // Enhance bottom navigation
        enhanceBottomNavigation();
        
        // Initialize ratings functionality
        if (typeof initRatings === 'function') {
            initRatings();
        } else {
            console.warn('Ratings module not loaded: initRatings function not found');
        }
        
        // Initialize feature modules
        if (typeof initSearch === 'function') {
            initSearch();
        }
        
        if (typeof initWeather === 'function') {
            initWeather();
        }
        
        if (typeof initCurrency === 'function') {
            initCurrency();
        }
        
        if (typeof initProducts === 'function') {
            initProducts();
        }
        
        // Add ripple effect
        addRippleEffect();
        
        // Add CSS for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.3);
                width: 100px;
                height: 100px;
                margin-top: -50px;
                margin-left: -50px;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Initialize UI and scroll effects
        if (typeof initScrollEffects === 'function') {
            initScrollEffects();
        } else {
            console.warn('Scroll effects not loaded: initScrollEffects function not found');
        }
        
        // Apply initial animations to elements
        if (typeof applyFadeInAnimation === 'function') {
            applyInitialAnimations();
        } else {
            console.warn('Animations not loaded: applyFadeInAnimation function not found');
        }
        
        // Handle back to top button if exists
        setupBackToTop();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; color: white;">
                <h2>Application Error</h2>
                <p>There was a problem initializing the application. Please try again later.</p>
                <p style="color: #aaa; margin-top: 20px;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #31748f; border: none; color: white; border-radius: 4px;">Reload</button>
            </div>
        `;
    }
}

// Start the initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting application initialization...');
    
    // Show loading indicator while waiting for authentication
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = '<div class="loading"></div>';
    }
    
    // Initialize the application
    initializeApplication();
});

/**
 * Setup Telegram WebApp specific functionality
 */
function setupTelegramWebApp() {
    try {
        // Expand to viewpoint
        window.Telegram.WebApp.expand();
        
        // Get theme from Telegram
        const colorScheme = window.Telegram.WebApp.colorScheme;
        if (colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
        
        // Setup safe areas
        const safeAreaInsetBottom = window.Telegram.WebApp.viewportStableHeight 
            ? `${window.innerHeight - window.Telegram.WebApp.viewportStableHeight}px` 
            : '0px';
        
        document.documentElement.style.setProperty('--safe-area-inset-bottom', safeAreaInsetBottom);
        
        console.log('Telegram WebApp configured with color scheme:', colorScheme);
    } catch (e) {
        console.error('Error setting up Telegram WebApp:', e);
    }
}

/**
 * Apply initial animations to page elements
 */
function applyInitialAnimations() {
    // Apply fade-in animations to section titles
    if (typeof applyFadeInAnimation === 'function') {
        applyFadeInAnimation('.section-title', 100);
    }
    
    // Add scroll-reveal class to all cards for animation
    document.querySelectorAll('.movie-card, .product-item, .rating-item').forEach(item => {
        if (!item.classList.contains('scroll-reveal')) {
            item.classList.add('scroll-reveal');
        }
    });
}

/**
 * Set up back to top button functionality
 */
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
            setTimeout(() => {
                backToTopBtn.style.opacity = '1';
            }, 10);
        } else {
            backToTopBtn.style.opacity = '0';
            setTimeout(() => {
                backToTopBtn.style.display = 'none';
            }, 300);
        }
    }, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}