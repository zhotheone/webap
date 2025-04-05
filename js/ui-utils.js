/**
 * UI Utilities for common UI operations
 * Supports both local and production environments
 */

// Use the global environment variable setup by auth-helper.js
const { isLocalhost, isGithubPages, isDevelopment } = window.appEnvironment || {
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isGithubPages: window.location.hostname === 'zhotheone.github.io',
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  };
  
  /**
   * Show loading spinner in a container
   * @param {HTMLElement} element - Container element to show loading in
   */
  function showLoading(element) {
    if (!element) return;
    element.innerHTML = '<div class="loading"></div>';
  }
  
  /**
   * Display a toast notification
   * @param {string} message - Message to display
   * @param {string} [type='info'] - Toast type (info, success, error, warning)
   * @param {number} [duration=3000] - Display duration in ms
   */
  function showToast(message, type = 'info', duration = 3000) {
    // Remove any existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.classList.add('toast');
    
    // Add toast type class if provided
    if (['info', 'success', 'error', 'warning'].includes(type)) {
      toast.classList.add(`toast-${type}`);
    }
    
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Add haptic feedback if in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      try {
        const hapticType = type === 'error' ? 'error' : 
                          type === 'warning' ? 'warning' : 'success';
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(hapticType);
      } catch (e) {
        console.warn('Haptic feedback error:', e);
      }
    }
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
  
  /**
   * Add ripple effect to elements
   */
  function addRippleEffect() {
    document.querySelectorAll('.ripple:not(.ripple-initialized)').forEach(button => {
      button.classList.add('ripple-initialized');
      button.addEventListener('mousedown', function(e) {
        const x = e.pageX - this.offsetLeft;
        const y = e.pageY - this.offsetTop;
        
        const rippleElement = document.createElement('span');
        rippleElement.classList.add('ripple-effect');
        rippleElement.style.left = `${x}px`;
        rippleElement.style.top = `${y}px`;
        
        this.appendChild(rippleElement);
        
        setTimeout(() => {
          rippleElement.remove();
        }, 600);
      });
    });
  }
  
  /**
   * Open an external link
   * @param {string} url - URL to open
   */
  function openExternalLink(url) {
    // If in Telegram WebApp, use their openLink method
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.openLink(url);
    } else {
      // Standard way to open URLs in browser
      window.open(url, '_blank');
    }
  }
  
  /**
   * Display user info in the header
   */
  function displayUserInfo() {
    const userInfoDiv = document.getElementById('user-info');
    if (!userInfoDiv) return;
    
    // Wait for auth to be ready
    if (window.waitForAuth) {
      window.waitForAuth().then(() => {
        updateUserInfo(userInfoDiv);
      });
    } else {
      updateUserInfo(userInfoDiv);
    }
  }
  
  /**
   * Update the user info div with current user information
   * @param {HTMLElement} userInfoDiv - The user info div element
   */
  function updateUserInfo(userInfoDiv) {
    // Get user information from Telegram if available
    const user = window.getTelegramUser ? window.getTelegramUser() : null;
    
    if (user) {
      // Display Telegram user information
      const initials = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
      const userAvatar = `<div class="user-avatar">${initials}</div>`;
      
      userInfoDiv.innerHTML = `
        ${userAvatar}
        <div class="user-name">${user.first_name || ''} ${user.last_name || ''}</div>
      `;
      
      console.log('Displayed Telegram user info:', user.first_name, user.last_name);
    } else {
      // Fallback for non-Telegram user
      const userId = window.currentUserId || 'Unknown';
      const userInitials = userId.substring(0, 2).toUpperCase();
      const userAvatar = `<div class="user-avatar">${userInitials}</div>`;
      
      userInfoDiv.innerHTML = `
        ${userAvatar}
        <div class="user-name">User (${userId})</div>
      `;
      
      console.log('Displayed user info with ID:', userId);
    }
  }
  
  // Make utility functions globally available
  window.showLoading = showLoading;
  window.showToast = showToast;
  window.addRippleEffect = addRippleEffect;
  window.openExternalLink = openExternalLink;
  window.displayUserInfo = displayUserInfo;