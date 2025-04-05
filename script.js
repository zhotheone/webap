// Configuration
const API_BASE_URL = 'http://localhost:10000/api'; // Local API URL
let currentUserId = 594235906;
let selectedImdbId = '';
let currentRating = 5;
let currentTab = 'ratings-section';
let userRatingsData = []; // Store the full ratings data for filtering

// Store user ID in localStorage for persistence
localStorage.setItem('userId', currentUserId);

// API client simplified for local use
const apiClient = {
    // Base URL
    baseUrl: API_BASE_URL,
    
    // GET request
    async get(endpoint) {
        try {
            console.log(`Making GET request to: ${this.baseUrl}${endpoint}`);
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // POST request
    async post(endpoint, data = null) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log(`Making POST request to: ${this.baseUrl}${endpoint}`, data);
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
};

// DOM elements
const userInfoDiv = document.getElementById('user-info');
const searchQueryInput = document.getElementById('searchQuery');
const searchButton = document.getElementById('searchButton');
const searchResultsDiv = document.getElementById('searchResults');
const userRatingsDiv = document.getElementById('userRatings');
const userProductsDiv = document.getElementById('userProducts');
const ratingModal = document.getElementById('ratingModal');
const productModal = document.getElementById('productModal');
const movieInfoDiv = document.getElementById('movieInfo');
const submitRatingBtn = document.getElementById('submitRating');
const addProductForm = document.getElementById('addProductForm');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const ratingStars = document.querySelectorAll('input[name="rating"]');
const ratingValueDisplay = document.querySelector('.rating-value');
const addProductFab = document.getElementById('addProductFab');
const closeBtns = document.querySelectorAll('.close');
const ratingFilterSelect = document.getElementById('ratingFilter');
const mediaTypeFilterSelect = document.getElementById('mediaTypeFilterSelect');
const sortOrderSelect = document.getElementById('sortOrder');

// Weather elements
const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherResultDiv = document.getElementById('weatherResult');

// Currency elements
const amountInput = document.getElementById('amountInput');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const conversionResultDiv = document.getElementById('conversionResult');

// Event listeners
searchButton.addEventListener('click', searchMovies);
searchQueryInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});
submitRatingBtn.addEventListener('click', submitRating);
addProductForm.addEventListener('submit', addProduct);
addProductFab.addEventListener('click', openProductModal);

// Filter event listeners
ratingFilterSelect.addEventListener('change', applyFilters);
mediaTypeFilterSelect.addEventListener('change', applyFilters);
sortOrderSelect.addEventListener('change', applyFilters);

// Weather event listener
getWeatherBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Currency event listener
convertBtn.addEventListener('click', convertCurrency);

// Modal close buttons
closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        ratingModal.style.display = 'none';
        productModal.style.display = 'none';
    });
});

window.addEventListener('click', function(e) {
    if (e.target === ratingModal) {
        ratingModal.style.display = 'none';
    }
    if (e.target === productModal) {
        productModal.style.display = 'none';
    }
});

// Bottom navigation
navItems.forEach(item => {
    item.addEventListener('click', function() {
        try {
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            console.log('Activating tab:', tabId);
            
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                console.log('Tab element:', tab.id, tab.classList);
            });
            
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
                console.log('Tab activated:', tabId);
                
                // Load data for the selected tab if needed
                if (tabId === 'ratings-section') {
                    fetchUserRatings().catch(err => console.error('Error fetching ratings:', err));
                } else if (tabId === 'tracker-section') {
                    fetchUserProducts().catch(err => console.error('Error fetching products:', err));
                }
            } else {
                console.error('Tab element not found:', tabId);
            }
            
            currentTab = tabId;
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    });
});

// Star rating system
ratingStars.forEach(star => {
    star.addEventListener('change', function() {
        currentRating = parseInt(this.value);
        console.log('Rating changed to:', currentRating);
        ratingValueDisplay.textContent = `${currentRating}/10`;
    });
});

// Ripple effect
document.querySelectorAll('.ripple').forEach(button => {
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

// Functions
function displayUserInfo() {
    // Create simple user avatar with initials for localhost
    const initials = 'LU'; // Local User
    const userAvatar = `<div class="user-avatar">${initials}</div>`;
    
    userInfoDiv.innerHTML = `
        ${userAvatar}
        <div class="user-name">Local User (${currentUserId})</div>
    `;
}

// Replace loadUserData function to prioritize ratings
async function loadUserData() {
    if (!currentUserId) {
        showToast('User ID unavailable');
        return;
    }
    
    // Load ratings first - most important
    await fetchUserRatings().catch(err => {
        console.error('Error fetching user ratings:', err);
        userRatingsDiv.innerHTML = '<p class="error-message">Failed to load ratings. Please try again later.</p>';
    });
    
    // Load products in the background
    fetchUserProducts().catch(err => {
        console.error('Error fetching products:', err);
    });
}

async function fetchUserRatings() {
    try {
        showLoading(userRatingsDiv);
        
        // Use query parameters for filtering
        const ratingFilter = ratingFilterSelect.value;
        const sortOrder = sortOrderSelect.value;
        const mediaTypeFilter = mediaTypeFilterSelect.value;
        
        let endpoint = `/ratings/user/${currentUserId}`;
        
        // Add query parameters
        const params = new URLSearchParams();
        
        if (ratingFilter !== 'all') {
            params.append('minRating', ratingFilter);
        }
        
        if (mediaTypeFilter !== 'all') {
            params.append('mediaType', mediaTypeFilter);
        }
        
        if (sortOrder) {
            params.append('sort', sortOrder);
        }
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        // Use the API client for the request
        const ratings = await apiClient.get(endpoint);
        userRatingsData = ratings;
        displayUserRatings(ratings);
    } catch (error) {
        console.error('Error:', error);
        userRatingsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

function displayUserRatings(ratings) {
    if (ratings.length === 0) {
        userRatingsDiv.innerHTML = '<p class="placeholder-text">Рейтингів не знайдено. Знайдіть фільми, щоб оцінити їх. 🎬</p>';
        return;
    }
    
    let html = '';
    ratings.forEach(movie => {
        // Get the badge color based on media type
        let typeBadgeColor = '';
        let typeIcon = '';
        switch(movie.mediaType) {
            case 'movie': 
                typeBadgeColor = 'var(--foam)';
                typeIcon = '🎬';
                break;
            case 'series': 
                typeBadgeColor = 'var(--iris)';
                typeIcon = '📺';
                break;
            case 'episode': 
                typeBadgeColor = 'var(--love)';
                typeIcon = '🎞️';
                break;
            case 'game': 
                typeBadgeColor = 'var(--gold)';
                typeIcon = '🎮';
                break;
            default: 
                typeBadgeColor = 'var(--subtle)';
                typeIcon = '🔍';
        }
        
        html += `
            <div class="movie-card">
                <img src="${movie.poster || 'https://via.placeholder.com/300x450?text=Немає+постера'}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-year">${movie.year || 'Н/Д'}</div>
                    <div class="movie-meta">
                        <span class="movie-rating">${movie.rating}/10 ⭐</span>
                        <span class="media-type-badge" style="background-color: ${typeBadgeColor}">
                            ${typeIcon} ${movie.mediaType === 'movie' ? 'Фільм' : 
                              movie.mediaType === 'series' ? 'Серіал' : 
                              movie.mediaType === 'episode' ? 'Епізод' : 
                              movie.mediaType === 'game' ? 'Гра' : 'Інше'}
                        </span>
                    </div>
                    <button class="rate-button ripple" onclick="openRatingModal('${movie.imdbId}', '${movie.title.replace(/'/g, "\\'")}', '${movie.year}', '${movie.poster}')">
                        <span class="material-symbols-outlined">edit</span>
                        Оцінити
                    </button>
                </div>
            </div>
        `;
    });
    
    userRatingsDiv.innerHTML = html;
    
    // Re-add ripple effect to new buttons
    addRippleEffect();
}

function applyFilters() {
    fetchUserRatings();
}

async function fetchUserProducts() {
    try {
        showLoading(userProductsDiv);
        
        // Use the API client
        const products = await apiClient.get(`/tracker/user/${currentUserId}`);
        displayUserProducts(products);
    } catch (error) {
        console.error('Error:', error);
        userProductsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

function displayUserProducts(products) {
    if (products.length === 0) {
        userProductsDiv.innerHTML = '<p class="placeholder-text">Відстежуваних товарів не знайдено. Додайте деякі за допомогою кнопки +. 🛍️</p>';
        return;
    }
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${product.productName}</div>
                    <div class="product-category">${product.category || 'Без категорії'}</div>
                </div>
                <div class="product-price">${product.price ? product.price.toFixed(2) + ' ₴' : 'Н/Д'}</div>
                <div class="product-link">
                    ${product.url ? `<a href="#" onclick="openExternalLink('${product.url}'); return false;">
                        <span class="material-symbols-outlined">open_in_new</span>
                    </a>` : ''}
                </div>
            </div>
        `;
    });
    
    userProductsDiv.innerHTML = html;
}

function openExternalLink(url) {
    // Standard way to open URLs
    window.open(url, '_blank');
}

async function searchMovies() {
    const query = searchQueryInput.value.trim();
    if (!query) {
        showToast('Please enter a search query');
        return;
    }
    
    try {
        showLoading(searchResultsDiv);
        
        // Log before making the request
        console.log(`Searching for movies with query: "${query}"`);
        
        // Make the API request
        const results = await apiClient.get(`/ratings/search/${encodeURIComponent(query)}`);
        
        // Log the response data
        console.log('Search results received:', results);
        
        // Handle empty results
        if (!results || results.length === 0) {
            searchResultsDiv.innerHTML = '<p class="placeholder-text">No results found. Try a different search term.</p>';
            return;
        }
        
        // Display the results
        displaySearchResults(results);
    } catch (error) {
        console.error('Error during search:', error);
        searchResultsDiv.innerHTML = `<p class="error-message">Search failed: ${error.message}</p>`;
        searchOmdbDirectly();
    }
}

// Fallback function to search OMDB directly (if server is not responding)
async function searchOmdbDirectly() {
    const query = searchQueryInput.value.trim();
    if (!query) {
        showToast('Please enter a search query');
        return;
    }
    
    try {
        showLoading(searchResultsDiv);
        
        console.log('Using direct OMDB search fallback');
        
        // OMDB API Key (you can use the same one as backend)
        const OMDB_API_KEY = '50a149c4'; // This is already public in your code
        
        // Direct API call to OMDB
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`OMDB API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Direct OMDB response:', data);
        
        if (data.Response === 'False') {
            searchResultsDiv.innerHTML = `<p class="placeholder-text">${data.Error || 'No results found'}</p>`;
            return;
        }
        
        displaySearchResults(data.Search);
    } catch (error) {
        console.error('Error with direct OMDB search:', error);
        searchResultsDiv.innerHTML = `<p class="error-message">Search failed: ${error.message}</p>`;
    }
}

function displaySearchResults(results) {
    if (!results || results.length === 0) {
        searchResultsDiv.innerHTML = '<p class="placeholder-text">No results found. Try a different search term.</p>';
        return;
    }
    
    console.log(`Displaying ${results.length} search results`);
    
    let html = '';
    results.forEach(movie => {
        // Log each movie to verify data
        console.log('Processing movie:', movie);
        
        // Ensure movie has all required properties
        if (!movie.Title || !movie.imdbID) {
            console.warn('Movie missing required properties:', movie);
            return;
        }
        
        // Sanitize the title to avoid quote issues
        const sanitizedTitle = movie.Title.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        html += `
            <div class="movie-card">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                     alt="${sanitizedTitle}" class="movie-poster">
                <div class="movie-info">
                    <div class="movie-title">${movie.Title}</div>
                    <div class="movie-year">${movie.Year || 'N/A'}</div>
                    <button class="rate-button ripple" onclick="openRatingModal('${movie.imdbID}', '${sanitizedTitle}', '${movie.Year || ''}', '${movie.Poster !== 'N/A' ? movie.Poster : ''}')">
                        <span class="material-symbols-outlined">star</span>
                        Rate
                    </button>
                </div>
            </div>
        `;
    });
    
    searchResultsDiv.innerHTML = html;
    
    // Re-add ripple effect to new buttons
    addRippleEffect();
    
    console.log('Search results display completed');
}

function openRatingModal(imdbId, title, year, poster) {
    console.log('Opening rating modal for:', title, imdbId);
    if (!currentUserId) {
        showToast('User ID unavailable');
        return;
    }
    
    selectedImdbId = imdbId;
    
    // Check if poster is 'N/A' or undefined
    const posterUrl = (poster && poster !== 'N/A') ? poster : 'https://via.placeholder.com/120x180?text=No+Poster';
    
    movieInfoDiv.innerHTML = `
        <img src="${posterUrl}" alt="${title}">
        <div class="movie-details">
            <h4>${title}</h4>
            <p>${year}</p>
        </div>
    `;
    
    // Reset star rating to 5 by default
    currentRating = 5;
    ratingValueDisplay.textContent = '5/10';
    
    // Uncheck all existing stars
    ratingStars.forEach(star => {
        star.checked = false;
    });
    
    // Check the star for rating 5
    const star5 = document.getElementById('star5');
    if (star5) {
        star5.checked = true;
    }
    
    // Display the modal
    ratingModal.style.display = 'block';
    console.log('Rating modal displayed');
}

async function submitRating() {
    try {
        console.log(`Submitting rating: ${currentRating}/10 for movie ID: ${selectedImdbId}`);
        
        // Use the API client
        await apiClient.post(`/ratings/add/${currentUserId}_${selectedImdbId}_${currentRating}`);
        
        // Close modal
        ratingModal.style.display = 'none';
        
        // Refresh user ratings
        await fetchUserRatings();
        
        // Show success message
        showToast('Rating successfully added! 🌟');
    } catch (error) {
        console.error('Error submitting rating:', error);
        showToast(`Error: ${error.message}`);
    }
}

function openProductModal() {
    if (!currentUserId) {
        showToast('ID користувача недоступний');
        return;
    }
    
    // Reset form
    addProductForm.reset();
    
    productModal.style.display = 'block';
}

async function addProduct(e) {
    e.preventDefault();
    
    if (!currentUserId) {
        showToast('ID користувача недоступний');
        return;
    }
    
    const productData = {
        userId: currentUserId,
        productId: document.getElementById('productId').value,
        productName: document.getElementById('productName').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value ? parseFloat(document.getElementById('price').value) : null,
        url: document.getElementById('url').value
    };
    
    try {
        // Use the API client
        await apiClient.post('/tracker/add', productData);
        
        // Reset form and close modal
        addProductForm.reset();
        productModal.style.display = 'none';
        
        // Refresh user products
        await fetchUserProducts();
        
        // Show success message
        showToast('Товар успішно додано! 🛍️');
    } catch (error) {
        console.error('Error:', error);
        showToast(`Помилка: ${error.message}`);
    }
}

// Weather function (mock implementation - would need actual API)
async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showToast('Будь ласка, введіть назву міста');
        return;
    }
    
    showLoading(weatherResultDiv);
    
    // This is a mock implementation - in a real app, you would call a weather API
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock weather data with Ukrainian cities
        const mockWeathers = {
            'київ': { temp: 12, condition: 'Хмарно', humidity: 65, wind: 10 },
            'львів': { temp: 10, condition: 'Дощ', humidity: 80, wind: 5 },
            'одеса': { temp: 15, condition: 'Сонячно', humidity: 55, wind: 15 },
            'харків': { temp: 11, condition: 'Вітряно', humidity: 60, wind: 25 },
            'дніпро': { temp: 13, condition: 'Ясно', humidity: 50, wind: 8 },
            'запоріжжя': { temp: 14, condition: 'Мінливо', humidity: 60, wind: 12 }
        };
        
        const cityLower = city.toLowerCase();
        const weatherData = mockWeathers[cityLower] || {
            temp: Math.floor(Math.random() * 30),
            condition: ['Сонячно', 'Хмарно', 'Дощ', 'Сніг', 'Вітряно'][Math.floor(Math.random() * 5)],
            humidity: Math.floor(Math.random() * 100),
            wind: Math.floor(Math.random() * 30)
        };
        
        weatherResultDiv.innerHTML = `
            <div class="weather-details">
                <h3>${city.charAt(0).toUpperCase() + city.slice(1)}</h3>
                <div class="weather-main">
                    <span class="material-symbols-outlined weather-icon">
                        ${getWeatherIcon(weatherData.condition)}
                    </span>
                    <div class="temperature">${weatherData.temp}°C</div>
                </div>
                <div class="weather-condition">${weatherData.condition}</div>
                <div class="weather-info">
                    <div class="humidity">
                        <span class="material-symbols-outlined">water_drop</span>
                        ${weatherData.humidity}% 💧
                    </div>
                    <div class="wind">
                        <span class="material-symbols-outlined">air</span>
                        ${weatherData.wind} км/г 💨
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        weatherResultDiv.innerHTML = `<p class="error-message">Не вдалося отримати дані про погоду</p>`;
    }
}

function getWeatherIcon(condition) {
    switch (condition.toLowerCase()) {
        case 'сонячно': return 'wb_sunny';
        case 'ясно': return 'clear_day';
        case 'хмарно': return 'cloud';
        case 'мінливо': return 'partly_cloudy_day';
        case 'дощ': return 'rainy';
        case 'сніг': return 'weather_snowy';
        case 'вітряно': return 'air';
        default: return 'cloud';
    }
}

// Currency function (mock implementation - would need actual API)
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) {
        showToast('Будь ласка, введіть дійсну суму');
        return;
    }
    
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    showLoading(conversionResultDiv);
    
    // This is a mock implementation - in a real app, you would call a currency API
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock exchange rates (relative to USD)
        const rates = {
            USD: 1.0,
            EUR: 0.93,
            GBP: 0.79,
            JPY: 153.82,
            CAD: 1.35,
            UAH: 38.5  // Added Ukrainian Hryvnia
        };
        
        // Convert to USD first, then to target currency
        const usdAmount = amount / rates[fromCurrency];
        const convertedAmount = usdAmount * rates[toCurrency];
        
        conversionResultDiv.innerHTML = `
            <div class="conversion-details">
                <h3 class="conversion-result-value">${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}</h3>
                <p class="conversion-rate">1 ${fromCurrency} = ${(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} ${toCurrency}</p>
                <p class="conversion-time">Оновлено: ${new Date().toLocaleTimeString()} 🕒</p>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        conversionResultDiv.innerHTML = `<p class="error-message">Не вдалося конвертувати валюту</p>`;
    }
}

// Helper functions
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function showToast(message) {
    // Remove any existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Fix tab navigation
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
                console.log('Tab element:', tab.id, tab.classList);
            });
            
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
                console.log('Tab activated:', tabId);
                
                // Load data for the selected tab if needed
                if (tabId === 'ratings-section') {
                    fetchUserRatings().catch(err => console.error('Error fetching ratings:', err));
                } else if (tabId === 'tracker-section') {
                    fetchUserProducts().catch(err => console.error('Error fetching products:', err));
                }
            } else {
                console.error('Tab element not found:', tabId);
            }
            
            currentTab = tabId;
        });
    });
    
    // Add ripple effect styling
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
        
        @font-face {
            font-family: 'Fira Code';
            src: url('https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/woff2/FiraCode-Regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        
        body {
            font-family: 'Fira Code', monospace;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize star rating system
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach(input => {
        input.addEventListener('change', function() {
            currentRating = this.value;
            ratingValueDisplay.textContent = `${currentRating}/10`;
        });
    });
    
    // Set default rating
    document.getElementById('star5').checked = true;
    
    // Display user info
    displayUserInfo();
    
    // Load user data automatically
    loadUserData();
    
    // Add ripple effect to all buttons with the ripple class
    addRippleEffect();
    
    // Make sure rating modal can be closed properly
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Close button clicked');
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Load user ratings on startup
    console.log('Loading user ratings on startup');
    fetchUserRatings().catch(err => {
        console.error('Error loading user ratings:', err);
    });
    
    console.log('Initialization complete');
});

// Make functions accessible globally
window.openRatingModal = openRatingModal;
window.openProductModal = openProductModal;
window.openExternalLink = openExternalLink;