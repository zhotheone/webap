// filepath: /home/madlen/bots/tgchatbot-api/frontend/js/currency.js
/**
 * Currency Module
 * Handles currency conversion functionality
 */

/**
 * Initialize currency functionality
 */
function initCurrency() {
    console.log('Initializing currency functionality');
    
    // Set up convert button
    const convertBtn = document.getElementById('convertBtn');
    const amountInput = document.getElementById('amountInput');
    const swapBtn = document.querySelector('.swap-icon');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', convertCurrency);
    }
    
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                convertCurrency();
            }
        });
    }
    
    // Add swap functionality
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // Load available currencies from API
    loadCurrencies();
    
    console.log('Currency functionality initialized');
}

/**
 * Convert currency using the API or fallback to mock data
 */
async function convertCurrency() {
    const amountInput = document.getElementById('amountInput');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const conversionResultDiv = document.getElementById('conversionResult');
    
    if (!amountInput || !fromCurrencySelect || !toCurrencySelect || !conversionResultDiv) {
        console.error('Currency elements not found');
        return;
    }
    
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) {
        showToast('Please enter a valid amount');
        return;
    }
    
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    showLoading(conversionResultDiv);
    
    try {
        console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);
        
        // Try the API first
        try {
            // Use the API client to call the backend conversion endpoint
            const response = await apiClient.get(
                `/currency/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
            );
            
            if (!response || !response.success) {
                throw new Error(response.error || 'Failed to convert currency');
            }
            
            const conversionData = response.data;
            console.log('Conversion data received:', conversionData);
            
            // Display conversion result with API data
            conversionResultDiv.innerHTML = `
                <div class="conversion-details">
                    <h3 class="conversion-result-value">${amount.toFixed(2)} ${fromCurrency} = ${conversionData.amount.toFixed(2)} ${toCurrency}</h3>
                    <p class="conversion-rate">1 ${fromCurrency} = ${conversionData.rate.toFixed(4)} ${toCurrency}</p>
                    <p class="conversion-time">Updated: ${new Date(conversionData.timestamp).toLocaleTimeString()} 🕒</p>
                </div>
            `;
            return;
        } catch (apiError) {
            console.warn('API conversion failed, using fallback:', apiError);
            // Continue to fallback method
        }
        
        // Fallback to mock conversion if API fails
        console.log('Using fallback conversion method');
        
        // Mock exchange rates (relative to USD)
        const rates = {
            USD: 1.0,
            EUR: 0.93,
            GBP: 0.79,
            JPY: 153.82,
            CAD: 1.35,
            UAH: 38.5,
            AUD: 1.48,
            CHF: 0.88,
            CNY: 7.25,
            INR: 83.15
        };
        
        // Convert to USD first, then to target currency
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            throw new Error('Unsupported currency in fallback mode');
        }
        
        const usdAmount = amount / rates[fromCurrency];
        const convertedAmount = usdAmount * rates[toCurrency];
        const rate = rates[toCurrency] / rates[fromCurrency];
        
        conversionResultDiv.innerHTML = `
            <div class="conversion-details">
                <h3 class="conversion-result-value">${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}</h3>
                <p class="conversion-rate">1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}</p>
                <p class="conversion-time">
                    Updated: ${new Date().toLocaleTimeString()} 🕒
                    <span class="fallback-notice">(Fallback rates)</span>
                </p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error converting currency:', error);
        conversionResultDiv.innerHTML = `
            <p class="error-message">
                Could not convert currency: ${error.message}
                <br><small>Please try again later.</small>
            </p>
        `;
    }
}

/**
 * Load available currencies from the API or use fallback
 */
async function loadCurrencies() {
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    
    if (!fromCurrencySelect || !toCurrencySelect) {
        console.error('Currency select elements not found');
        return;
    }
    
    // Try to load currencies from API first
    try {
        console.log('Fetching available currencies from API');
        
        // Use the API client to get currency list
        const response = await apiClient.get('/currency/list');
        
        if (response && response.success && response.data && response.data.length > 0) {
            const currencies = response.data;
            console.log(`Successfully loaded ${currencies.length} currencies from API`);
            
            // Clear existing options
            fromCurrencySelect.innerHTML = '';
            toCurrencySelect.innerHTML = '';
            
            // Add common currencies first
            const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'UAH'];
            
            commonCurrencies.forEach(code => {
                const currency = currencies.find(c => c.code === code);
                if (currency) {
                    addCurrencyOption(fromCurrencySelect, currency);
                    addCurrencyOption(toCurrencySelect, currency);
                }
            });
            
            // Add separator
            if (currencies.length > commonCurrencies.length) {
                addSeparator(fromCurrencySelect);
                addSeparator(toCurrencySelect);
            }
            
            // Add all other currencies
            currencies
                .filter(c => !commonCurrencies.includes(c.code))
                .sort((a, b) => a.code.localeCompare(b.code))
                .forEach(currency => {
                    addCurrencyOption(fromCurrencySelect, currency);
                    addCurrencyOption(toCurrencySelect, currency);
                });
            
            // Set default selections
            setDefaultSelection(fromCurrencySelect, 'UAH');
            setDefaultSelection(toCurrencySelect, 'USD');
            
            return; // Success path
        } else {
            throw new Error('Invalid response format from currency API');
        }
    } catch (error) {
        console.warn('Failed to load currencies from API, using fallback:', error);
        // Continue to fallback method
    }
    
    // Fallback: Use hardcoded currencies
    console.log('Using fallback currency list');
    
    const fallbackCurrencies = [
        { code: 'USD', name: 'United States Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'UAH', name: 'Ukrainian Hryvnia' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'CHF', name: 'Swiss Franc' },
        { code: 'CNY', name: 'Chinese Yuan' },
        { code: 'INR', name: 'Indian Rupee' }
    ];
    
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    
    fallbackCurrencies.forEach(currency => {
        addCurrencyOption(fromCurrencySelect, currency);
        addCurrencyOption(toCurrencySelect, currency);
    });
    
    setDefaultSelection(fromCurrencySelect, 'UAH');
    setDefaultSelection(toCurrencySelect, 'USD');
    
    // Add a notification that we're using fallback data
    const notice = document.createElement('div');
    notice.className = 'fallback-notice';
    notice.textContent = 'Using offline currency data';
    notice.style.textAlign = 'center';
    notice.style.color = 'var(--muted)';
    notice.style.fontSize = '12px';
    notice.style.marginTop = '8px';
    
    const currencyCard = document.querySelector('.currency-card');
    if (currencyCard) {
        currencyCard.appendChild(notice);
    }
}

/**
 * Helper to add a currency option to a select
 */
function addCurrencyOption(select, currency) {
    const option = document.createElement('option');
    option.value = currency.code;
    option.textContent = `${currency.code} - ${currency.name}`;
    select.appendChild(option);
}

/**
 * Add a separator to the dropdown
 */
function addSeparator(select) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────────';
    select.appendChild(separator);
}

/**
 * Set default selection in dropdown
 */
function setDefaultSelection(select, code) {
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === code) {
            select.selectedIndex = i;
            break;
        }
    }
}

/**
 * Swap from and to currencies
 */
function swapCurrencies() {
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    
    if (!fromCurrencySelect || !toCurrencySelect) return;
    
    const fromValue = fromCurrencySelect.value;
    const toValue = toCurrencySelect.value;
    
    // Swap values
    setDefaultSelection(fromCurrencySelect, toValue);
    setDefaultSelection(toCurrencySelect, fromValue);
    
    // If amount is entered, automatically convert
    const amountInput = document.getElementById('amountInput');
    if (amountInput && parseFloat(amountInput.value) > 0) {
        convertCurrency();
    }
}