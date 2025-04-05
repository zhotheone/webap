// Simple console for debugging - improved for production
(function() {
  // Only create debug panel in development environment
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Don't run in production unless explicitly enabled with debug=true URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const debugEnabled = urlParams.get('debug') === 'true';
  
  if (!isLocalhost && !debugEnabled) {
    console.log('Debug panel disabled in production. Add ?debug=true to URL to enable.');
    return;
  }
  
  const debugPanel = document.createElement('div');
  debugPanel.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 10px;
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 24px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  debugPanel.innerHTML = '🐞';
  
  const logPanel = document.createElement('div');
  logPanel.style.cssText = `
    position: fixed;
    bottom: 130px;
    left: 10px;
    right: 10px;
    height: 200px;
    background: rgba(0, 0, 0, 0.9);
    color: #00ff00;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    overflow-y: auto;
    z-index: 9998;
    border-radius: 8px;
    display: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;
  
  document.body.appendChild(debugPanel);
  document.body.appendChild(logPanel);
  
  let isOpen = false;
  
  debugPanel.addEventListener('click', function() {
    isOpen = !isOpen;
    
    if (isOpen) {
      logPanel.style.display = 'block';
    } else {
      logPanel.style.display = 'none';
    }
  });
  
  // Override console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  function addLogEntry(type, args) {
    const entry = document.createElement('div');
    entry.style.marginBottom = '5px';
    entry.style.borderBottom = '1px solid #333';
    entry.style.paddingBottom = '5px';
    
    let color;
    let prefix;
    switch(type) {
      case 'error':
        color = '#ff5555';
        prefix = '❌ ERROR: ';
        break;
      case 'warn':
        color = '#ffaa00';
        prefix = '⚠️ WARN: ';
        break;
      default:
        color = '#00ff00';
        prefix = '📝 LOG: ';
    }
    
    entry.style.color = color;
    
    const time = new Date().toTimeString().split(' ')[0];
    let content = `[${time}] ${prefix}`;
    
    args.forEach(arg => {
      if (typeof arg === 'object') {
        try {
          content += JSON.stringify(arg) + ' ';
        } catch (e) {
          content += arg + ' ';
        }
      } else {
        content += arg + ' ';
      }
    });
    
    entry.textContent = content;
    logPanel.appendChild(entry);
    logPanel.scrollTop = logPanel.scrollHeight;
  }
  
  console.log = function() {
    addLogEntry('log', Array.from(arguments));
    originalLog.apply(console, arguments);
  };
  
  console.error = function() {
    addLogEntry('error', Array.from(arguments));
    originalError.apply(console, arguments);
  };
  
  console.warn = function() {
    addLogEntry('warn', Array.from(arguments));
    originalWarn.apply(console, arguments);
  };
  
  // Add test API button only in development
  if (isLocalhost) {
    const apiBaseUrl = window.apiClient ? window.apiClient.baseUrl : 'http://localhost:10000/api';
    
    const testApiButton = document.createElement('button');
    testApiButton.style.cssText = `
      position: fixed;
      bottom: 70px;
      right: 70px;
      padding: 10px 15px;
      background: var(--pine);
      color: white;
      border: none;
      border-radius: 5px;
      z-index: 9999;
      cursor: pointer;
    `;
    testApiButton.textContent = 'Test API';
    document.body.appendChild(testApiButton);
    
    testApiButton.addEventListener('click', async function() {
      try {
        console.log('Testing API connection...');
        const response = await fetch(`${apiBaseUrl}/debug`);
        
        // Check if response is ok
        if (!response.ok) {
          console.error(`API request failed with status: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          return;
        }
        
        // Get response as text first
        const responseText = await response.text();
        console.log('Raw API response:', responseText);
        
        // Try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          console.log('API response parsed:', data);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
        }
      } catch (error) {
        console.error('API test failed:', error);
      }
    });
  }
})();