// filepath: /home/madlen/bots/tgchatbot-api/frontend/js/navigation.js
/**
 * Navigation Module
 * Manages tab and section navigation
 */

// Current state
let currentTab = 'ratings-section';

/**
 * Initialize bottom tab navigation
 */
function initTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Initializing tab navigation with', navItems.length, 'items');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            console.log('Activating tab:', tabId);
            
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
                console.log('Tab activated:', tabId);
                
                // Load data for the selected tab if needed
                if (tabId === 'ratings-section') {
                    if (typeof loadUserRatings === 'function') {
                        loadUserRatings();
                    }
                } else if (tabId === 'tracker-section') {
                    if (typeof fetchUserProducts === 'function') {
                        fetchUserProducts();
                    }
                }
            } else {
                console.error('Tab element not found:', tabId);
            }
            
            currentTab = tabId;
        });
    });
    
    console.log('Tab navigation initialized');
}

/**
 * Initialize media section navigation (top nav)
 */
function initMediaNavigation() {
    const topNavItems = document.querySelectorAll('.top-nav-item');
    const mediaSections = document.querySelectorAll('.media-section');
    
    console.log('Initializing media navigation with', topNavItems.length, 'items');
    
    // Add visual click feedback
    topNavItems.forEach(item => {
        item.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add tab switching functionality
    topNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            console.log('Media section clicked:', sectionId);
            
            // Add visual feedback before switching
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 200);
            
            // Update active nav item
            topNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding media section
            mediaSections.forEach(section => section.classList.remove('active'));
            
            const sectionElement = document.getElementById(sectionId);
            if (sectionElement) {
                sectionElement.classList.add('active');
                console.log('Media section activated:', sectionId);
                
                // Load data if needed
                if (sectionId === 'media-gallery') {
                    if (typeof loadUserRatings === 'function') {
                        loadUserRatings();
                    }
                }
            } else {
                console.error('Media section element not found:', sectionId);
            }
        });
    });
    
    console.log('Media navigation initialized');
}

// Add enhanced feedback to bottom navigation
function enhanceBottomNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}