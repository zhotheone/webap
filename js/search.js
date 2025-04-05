// filepath: /home/madlen/bots/tgchatbot-api/frontend/js/search.js
/**
 * Search Module
 * Handles movie search functionality
 */

// Reference to API client (ensure api-client.js is loaded before this file)
const searchApiClient = window.apiClient || {};

/**
 * Initialize search functionality
 */
function initSearch() {
    console.log('Initializing search functionality');
    
    // Set up search button
    const searchButton = document.getElementById('searchButton');
    const searchQueryInput = document.getElementById('searchQuery');
    
    if (searchButton) {
        searchButton.addEventListener('click', searchMovies);
    }
    
    if (searchQueryInput) {
        searchQueryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchMovies();
            }
        });
    }
    
    console.log('Search functionality initialized');
}

/**
 * Search for movies
 */
async function searchMovies() {
    const searchQueryInput = document.getElementById('searchQuery');
    const searchResultsDiv = document.getElementById('searchResults');
    
    if (!searchQueryInput || !searchResultsDiv) {
        console.error('Search elements not found');
        return;
    }
    
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
        const results = await searchApiClient.get(`/ratings/search/${encodeURIComponent(query)}`);
        
        // Log the response data
        console.log('Search results received:', results);
        
        // Display the results
        displaySearchResults(results);
    } catch (error) {
        console.error('Error during search:', error);
        searchResultsDiv.innerHTML = `<p class="error-message">Search failed: ${error.message}</p>`;
        
        // Try direct OMDB search as fallback
        tryDirectSearch(query);
    }
}

/**
 * Display search results
 */
function displaySearchResults(results) {
    const searchResultsDiv = document.getElementById('searchResults');
    if (!searchResultsDiv) return;
    
    if (!results || results.length === 0) {
        searchResultsDiv.innerHTML = '<p class="placeholder-text">No results found. Try a different search term.</p>';
        return;
    }
    
    console.log(`Displaying ${results.length} search results`);
    
    let html = '';
    results.forEach(movie => {
        // Ensure movie has all required properties
        if (!movie.Title || !movie.imdbID) {
            console.warn('Movie missing required properties:', movie);
            return;
        }
        
        // Sanitize the title to avoid quote issues
        const sanitizedTitle = movie.Title.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        // Add IMDb rating bubble if available (search results don't usually include ratings)
        const imdbRatingBubble = movie.imdbRating ? 
            `<div class="imdb-rating">
                <span class="imdb-score">${movie.imdbRating}</span>
                <span class="imdb-votes">${formatVotes(movie.imdbVotes)}</span>
            </div>` : '';
        
        html += `
            <div class="movie-card">
                <div class="poster-container">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                        alt="${sanitizedTitle}" class="movie-poster">
                    ${imdbRatingBubble}
                </div>
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
    addRippleEffect();
    
    console.log('Search results display completed');
}

// Helper function for formatting votes - reused from ratings.js
function formatVotes(votes) {
    if (!votes) return '';
    
    // Remove commas and convert to number
    const numVotes = parseInt(votes.replace(/,/g, ''));
    
    if (isNaN(numVotes)) return votes;
    
    if (numVotes >= 1000000) {
        return (numVotes / 1000000).toFixed(1) + 'M';
    } else if (numVotes >= 1000) {
        return (numVotes / 1000).toFixed(1) + 'K';
    }
    
    return numVotes;
}

/**
 * Fallback function to search OMDB directly
 */
async function tryDirectSearch(query) {
    try {
        console.log('Using direct OMDB search fallback');
        
        const searchResultsDiv = document.getElementById('searchResults');
        
        // OMDB API Key
        const OMDB_API_KEY = '50a149c4';
        
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
    }
}