/**
 * Scroll Effects and Animations
 * Handles smooth scrolling, reveal animations, parallax effects,
 * and other scroll-related UI enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll effects
    initScrollEffects();
});

/**
 * Initialize all scroll effects
 */
function initScrollEffects() {
    console.log('Initializing scroll effects...');
    
    // Set up scroll reveal animations
    setupScrollReveal();
    
    // Set up scroll progress indicator
    setupScrollProgress();
    
    // Set up header scroll effects
    setupHeaderEffects();
    
    // Set up modal animations
    setupModalEffects();
    
    console.log('Scroll effects initialized');
}

/**
 * Set up scroll reveal animation for elements
 */
function setupScrollReveal() {
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    
    if (scrollElements.length === 0) return;
    
    const elementInView = (el, percentageScroll = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= (window.innerHeight * (percentageScroll/100)));
    };
    
    const displayScrollElement = (element) => {
        element.classList.add('visible');
    };
    
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 90)) {
                displayScrollElement(el);
            }
        });
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    }, { passive: true });
    
    // Trigger once on initial load
    handleScrollAnimation();
}

/**
 * Set up scroll progress indicator bar
 */
function setupScrollProgress() {
    // Create progress bar element if it doesn't exist
    let progressBar = document.querySelector('.scroll-progress');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }
    
    // Update progress bar on scroll
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        progressBar.style.width = scrolled + '%';
    }, { passive: true });
}

/**
 * Set up header effects on scroll
 */
function setupHeaderEffects() {
    const header = document.querySelector('.app-header');
    
    if (!header) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class when scrolling down
        if (scrollTop > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });
}

/**
 * Set up modal animation effects
 */
function setupModalEffects() {
    // Add active class to modal for animation when opened
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // We need to use MutationObserver to watch for style changes
        // since we can't directly override the style property
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const displayStyle = modal.style.display;
                    if (displayStyle === 'block' || displayStyle === 'flex') {
                        setTimeout(() => {
                            modal.classList.add('active');
                        }, 10);
                    } else if (displayStyle === 'none') {
                        modal.classList.remove('active');
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    });
}

/**
 * Apply fade-in-up animation to elements
 * @param {string} selector - CSS selector for target elements
 * @param {number} delayIncrement - Delay increment between items (ms)
 */
function applyFadeInAnimation(selector, delayIncrement = 100) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animation = 'none';
        
        setTimeout(() => {
            el.style.animation = `fadeInUp 0.6s ease ${index * delayIncrement / 1000}s forwards`;
        }, 10);
    });
}
