// filepath: /home/madlen/bots/tgchatbot-api/frontend/js/weather.js
/**
 * Weather Module
 * Handles weather functionality
 */

/**
 * Initialize weather functionality
 */
function initWeather() {
    console.log('Initializing weather functionality');
    
    // Set up weather button
    const getWeatherBtn = document.getElementById('getWeatherBtn');
    const cityInput = document.getElementById('cityInput');
    
    if (getWeatherBtn) {
        getWeatherBtn.addEventListener('click', getWeather);
    }
    
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
    }
    
    console.log('Weather functionality initialized');
}

/**
 * Get weather for a city using the API
 */
async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const weatherResultDiv = document.getElementById('weatherResult');
    
    if (!cityInput || !weatherResultDiv) {
        console.error('Weather elements not found');
        return;
    }
    
    const city = cityInput.value.trim();
    if (!city) {
        showToast('Please enter a city name');
        return;
    }
    
    showLoading(weatherResultDiv);
    
    try {
        console.log(`Fetching weather for city: ${city}`);
        
        // Use the API client to call the backend weather endpoint
        const response = await apiClient.get(`/weather/current?city=${encodeURIComponent(city)}&units=metric`);
        
        if (!response || !response.success) {
            throw new Error(response.error || 'Failed to get weather data');
        }
        
        const weatherData = response.data;
        console.log('Weather data received:', weatherData);
        
        // Display weather data with the API response format
        weatherResultDiv.innerHTML = `
            <div class="weather-details">
                <h3>${weatherData.location.name}, ${weatherData.location.country}</h3>
                <div class="weather-main">
                    <img src="${weatherData.weather.icon}" alt="${weatherData.weather.description}" class="weather-icon-img">
                    <div class="temperature">${Math.round(weatherData.temperature.current)}${weatherData.temperature.units}</div>
                </div>
                <div class="weather-condition">${weatherData.weather.condition} - ${weatherData.weather.description}</div>
                <div class="weather-info">
                    <div class="humidity">
                        <span class="material-symbols-outlined">water_drop</span>
                        ${weatherData.humidity}% 💧
                    </div>
                    <div class="wind">
                        <span class="material-symbols-outlined">air</span>
                        ${weatherData.wind.speed} ${weatherData.wind.units} 💨
                    </div>
                </div>
                <div class="weather-extra">
                    <p>Feels like: ${Math.round(weatherData.temperature.feelsLike)}${weatherData.temperature.units}</p>
                    <p>Pressure: ${weatherData.pressure} hPa</p>
                    <p>Visibility: ${weatherData.visibility / 1000} km</p>
                </div>
                <div class="weather-time">
                    <p>Updated: ${new Date(weatherData.timestamp).toLocaleTimeString()}</p>
                    <p>🌅 ${new Date(weatherData.sunrise).toLocaleTimeString()} - 🌇 ${new Date(weatherData.sunset).toLocaleTimeString()}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherResultDiv.innerHTML = `
            <p class="error-message">
                Could not get weather data: ${error.message}
                <br><small>Please check if the city name is correct.</small>
            </p>
        `;
    }
}

// Keep the utility function for converting weather conditions to material icons
// for fallback purposes
function getWeatherIcon(condition) {
    switch (condition.toLowerCase()) {
        case 'sunny': 
        case 'clear': return 'wb_sunny';
        case 'clouds':
        case 'cloudy': return 'cloud';
        case 'partly cloudy': return 'partly_cloudy_day';
        case 'rain': 
        case 'drizzle': return 'rainy';
        case 'thunderstorm': return 'thunderstorm';
        case 'snow': return 'weather_snowy';
        case 'mist': 
        case 'fog': return 'foggy';
        case 'windy': return 'air';
        default: return 'cloud';
    }
}