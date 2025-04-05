/**
 * Ratings Module
 * Handles media ratings functionality
 */

/**
 * Initialize ratings functionality
 */
// First, set a global currentRating variable
window.currentRating = 5;

/**
 * Initialize ratings functionality
 */
function initRatings() {
    console.log('Initializing ratings functionality');
    
    // Initialize star rating system
    const ratingStars = document.querySelectorAll('input[name="rating"]');
    const ratingValueDisplay = document.querySelector('.rating-value');
    
    if (ratingStars.length) {
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                // Use window.currentRating to avoid scope issues
                window.currentRating = parseInt(this.value);
                console.log('Rating changed to:', window.currentRating);
                if (ratingValueDisplay) {
                    ratingValueDisplay.textContent = `${window.currentRating}/10`;
                }
            });
        });
    } else {
        console.warn('Rating stars not found in DOM');
    }
    
    // Initialize submit button
    const submitRatingBtn = document.getElementById('submitRating');
    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', submitRating);
    }
    
    // Initialize filter controls
    const ratingFilterSelect = document.getElementById('ratingFilter');
    const mediaTypeFilterSelect = document.getElementById('mediaTypeFilter');
    const sortOrderSelect = document.getElementById('sortOrder');
    
    if (ratingFilterSelect) {
        ratingFilterSelect.addEventListener('change', applyFilters);
    }
    
    if (mediaTypeFilterSelect) {
        mediaTypeFilterSelect.addEventListener('change', applyFilters);
    }
    
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', applyFilters);
    }
    
    // Load user ratings initially
    loadUserRatings();
    
    console.log('Ratings functionality initialized');
}

/**
 * Apply filters to ratings
 */
function applyFilters() {
    console.log('Applying filters to ratings');
    loadUserRatings();
}

/**
 * Fetch user ratings from API
 */
async function fetchUserRatings() {
    try {
        const userRatingsDiv = document.getElementById('userRatings');
        if (!userRatingsDiv) return;
        
        if (!currentUserId) {
            userRatingsDiv.innerHTML = '<p class="error-message">User ID unavailable</p>';
            return;
        }
        
        showLoading(userRatingsDiv);
        
        // Use the API client
        const ratings = await apiClient.get(`/ratings/user/${currentUserId}`);
        displayUserRatings(ratings);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        const userRatingsDiv = document.getElementById('userRatings');
        if (userRatingsDiv) {
            userRatingsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }
}

/**
 * Display user ratings
 * @param {Array} ratings - Array of user ratings
 */
function displayUserRatings(ratings) {
    const userRatingsDiv = document.getElementById('userRatings');
    if (!userRatingsDiv) return;
    
    if (!ratings || ratings.length === 0) {
        userRatingsDiv.innerHTML = '<p class="placeholder-text">No ratings found. Search for a movie or show to rate it. 🎬</p>';
        return;
    }
    
    let html = '';
    
    ratings.forEach(rating => {
        html += `
            <div class="rating-item" data-id="${rating._id}">
                <div class="rating-poster">
                    ${rating.poster ? 
                      `<img src="${rating.poster}" alt="${rating.title}" onerror="this.onerror=null;this.src='img/no-poster.png';">` :
                      `<div class="no-poster"><span class="material-symbols-outlined">movie</span></div>`}
                </div>
                <div class="rating-info">
                    <div class="rating-title">${rating.title}</div>
                    <div class="rating-year">${rating.year || ''}</div>
                    <div class="rating-type">${rating.mediaType || 'movie'}</div>
                </div>
                <div class="rating-score">
                    <div class="user-rating">${rating.rating}/10</div>
                    ${rating.imdbRating ? `<div class="imdb-rating">IMDb: ${rating.imdbRating}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    userRatingsDiv.innerHTML = html;
    
    // Add click handlers after rendering the HTML
    document.querySelectorAll('.rating-item').forEach(item => {
        item.addEventListener('click', function() {
            const ratingId = this.getAttribute('data-id');
            showRatingDetails(ratingId);
        });
    });
}

/**
 * Show rating details in a modal
 * @param {string} ratingId - Rating ID
 */
window.showRatingDetails = async function(ratingId) {
    try {
        console.log('Opening rating details for ID:', ratingId);
        
        // Fetch rating details
        const rating = await apiClient.get(`/ratings/${ratingId}`);
        
        if (!rating) {
            showToast('Rating not found');
            return;
        }
        
        // Create modal content
        let modalContent = `
            <div class="modal-header">
                <h3>Rating Details</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="detail-section rating-detail">
                    <div class="rating-poster-large">
                        ${rating.poster ? 
                          `<img src="${rating.poster}" alt="${rating.title}" onerror="this.onerror=null;this.src='img/no-poster.png';">` :
                          `<div class="no-poster"><span class="material-symbols-outlined">movie</span></div>`}
                    </div>
                    <div class="rating-info-detail">
                        <h4>${rating.title} ${rating.year ? `(${rating.year})` : ''}</h4>
                        
                        <div class="detail-item">
                            <span class="detail-label">Your Rating:</span>
                            <span class="detail-value user-rating-large">${rating.rating}/10</span>
                        </div>
                        
                        ${rating.imdbRating ? `
                        <div class="detail-item">
                            <span class="detail-label">IMDb Rating:</span>
                            <span class="detail-value">${rating.imdbRating} (${rating.imdbVotes || 'N/A'} votes)</span>
                        </div>` : ''}
                        
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${rating.mediaType || 'movie'}</span>
                        </div>
                        
                        ${rating.genre ? `
                        <div class="detail-item">
                            <span class="detail-label">Genre:</span>
                            <span class="detail-value">${rating.genre}</span>
                        </div>` : ''}
                        
                        ${rating.director ? `
                        <div class="detail-item">
                            <span class="detail-label">Director:</span>
                            <span class="detail-value">${rating.director}</span>
                        </div>` : ''}
                        
                        ${rating.plot ? `
                        <div class="detail-item plot">
                            <span class="detail-label">Plot:</span>
                            <span class="detail-value">${rating.plot}</span>
                        </div>` : ''}
                        
                        <div class="detail-item">
                            <span class="detail-label">Rated on:</span>
                            <span class="detail-value">${new Date(rating.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="button-row">
                    <button class="ripple danger-button" onclick="deleteRating('${rating._id}')">
                        <span class="material-symbols-outlined">delete</span>
                        Delete Rating
                    </button>
                    ${rating.imdbId ? `
                    <button class="ripple secondary-button" onclick="openExternalLink('https://www.imdb.com/title/${rating.imdbId}/')">
                        <span class="material-symbols-outlined">open_in_new</span>
                        View on IMDb
                    </button>` : ''}
                </div>
            </div>
        `;
        
        // Display modal
        let detailModal = document.getElementById('detailModal');
        if (!detailModal) {
            // Create modal if it doesn't exist
            detailModal = document.createElement('div');
            detailModal.id = 'detailModal';
            detailModal.className = 'modal';
            detailModal.innerHTML = `<div class="modal-content">${modalContent}</div>`;
            document.body.appendChild(detailModal);
        } else {
            // Update existing modal
            detailModal.querySelector('.modal-content').innerHTML = modalContent;
        }
        
        // Add close functionality
        const closeBtn = detailModal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            detailModal.style.display = 'none';
        });
        
        // Close when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === detailModal) {
                detailModal.style.display = 'none';
            }
        });
        
        // Show the modal
        detailModal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing rating details:', error);
        showToast(`Error: ${error.message || 'Failed to load rating details'}`);
    }
}

/**
 * Delete a rating
 * @param {string} ratingId - Rating ID
 */
window.deleteRating = async function(ratingId) {
    try {
        if (!confirm('Are you sure you want to delete this rating?')) {
            return;
        }
        
        // Call API to delete the rating
        await apiClient.delete(`/ratings/${ratingId}`);
        
        // Close modal
        const detailModal = document.getElementById('detailModal');
        if (detailModal) {
            detailModal.style.display = 'none';
        }
        
        // Refresh ratings list
        await fetchUserRatings();
        
        showToast('Rating deleted successfully');
    } catch (error) {
        console.error('Error deleting rating:', error);
        showToast(`Error: ${error.message}`);
    }
}
/**
 * Ratings Module
 * Handles media ratings functionality
 */

/**
 * Initialize ratings functionality
 */
function initRatings() {
    console.log('Initializing ratings functionality');
    
    // Set up rating search button
    const searchMediaBtn = document.getElementById('searchMediaBtn');
    const mediaQueryInput = document.getElementById('mediaQueryInput');
    
    if (searchMediaBtn) {
        searchMediaBtn.addEventListener('click', searchMedia);
    }
    
    if (mediaQueryInput) {
        mediaQueryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchMedia();
            }
        });
    }
    
    // Load user ratings
    fetchUserRatings().catch(err => {
        console.error('Error loading ratings:', err);
    });
    
    console.log('Ratings functionality initialized');
}

/**
 * Fetch user ratings from API
 */
async function fetchUserRatings() {
    try {
        const userRatingsDiv = document.getElementById('userRatings');
        if (!userRatingsDiv) return;
        
        if (!currentUserId) {
            userRatingsDiv.innerHTML = '<p class="error-message">User ID unavailable</p>';
            return;
        }
        
        showLoading(userRatingsDiv);
        
        // Use the API client
        const ratings = await apiClient.get(`/ratings/user/${currentUserId}`);
        displayUserRatings(ratings);
    } catch (error) {
        console.error('Error:', error);
        const userRatingsDiv = document.getElementById('userRatings');
        if (userRatingsDiv) {
            userRatingsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }
}

/**
 * Display user ratings
 * @param {Array} ratings - Array of user ratings
 */
function displayUserRatings(ratings) {
    const userRatingsDiv = document.getElementById('userRatings');
    if (!userRatingsDiv) return;
    
    if (!ratings || ratings.length === 0) {
        userRatingsDiv.innerHTML = '<p class="placeholder-text">No ratings found. Search for a movie or show to rate it. 🎬</p>';
        return;
    }
    
    let html = '';
    
    ratings.forEach(rating => {
        html += `
            <div class="rating-item" data-id="${rating._id}" onclick="showRatingDetails('${rating._id}')">
                <div class="rating-poster">
                    ${rating.poster ? 
                      `<img src="${rating.poster}" alt="${rating.title}" onerror="this.onerror=null;this.src='img/no-poster.png';">` :
                      `<div class="no-poster"><span class="material-symbols-outlined">movie</span></div>`}
                </div>
                <div class="rating-info">
                    <div class="rating-title">${rating.title}</div>
                    <div class="rating-year">${rating.year || ''}</div>
                    <div class="rating-type">${rating.mediaType || 'movie'}</div>
                </div>
                <div class="rating-score">
                    <div class="user-rating">${rating.rating}/10</div>
                    ${rating.imdbRating ? `<div class="imdb-rating">IMDb: ${rating.imdbRating}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    userRatingsDiv.innerHTML = html;
}

/**
 * Show rating details in a modal
 * @param {string} ratingId - Rating ID
 */
async function showRatingDetails(ratingId) {
    try {
        // Fetch rating details
        const rating = await apiClient.get(`/ratings/${ratingId}`);
        
        if (!rating) {
            showToast('Rating not found');
            return;
        }
        
        // Create modal content
        let modalContent = `
            <div class="modal-header">
                <h3>Rating Details</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="detail-section rating-detail">
                    <div class="rating-poster-large">
                        ${rating.poster ? 
                          `<img src="${rating.poster}" alt="${rating.title}" onerror="this.onerror=null;this.src='img/no-poster.png';">` :
                          `<div class="no-poster"><span class="material-symbols-outlined">movie</span></div>`}
                    </div>
                    <div class="rating-info-detail">
                        <h4>${rating.title} ${rating.year ? `(${rating.year})` : ''}</h4>
                        
                        <div class="detail-item">
                            <span class="detail-label">Your Rating:</span>
                            <span class="detail-value user-rating-large">${rating.rating}/10</span>
                        </div>
                        
                        ${rating.imdbRating ? `
                        <div class="detail-item">
                            <span class="detail-label">IMDb Rating:</span>
                            <span class="detail-value">${rating.imdbRating} (${rating.imdbVotes || 'N/A'} votes)</span>
                        </div>` : ''}
                        
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${rating.mediaType || 'movie'}</span>
                        </div>
                        
                        ${rating.genre ? `
                        <div class="detail-item">
                            <span class="detail-label">Genre:</span>
                            <span class="detail-value">${rating.genre}</span>
                        </div>` : ''}
                        
                        ${rating.director ? `
                        <div class="detail-item">
                            <span class="detail-label">Director:</span>
                            <span class="detail-value">${rating.director}</span>
                        </div>` : ''}
                        
                        ${rating.plot ? `
                        <div class="detail-item plot">
                            <span class="detail-label">Plot:</span>
                            <span class="detail-value">${rating.plot}</span>
                        </div>` : ''}
                        
                        <div class="detail-item">
                            <span class="detail-label">Rated on:</span>
                            <span class="detail-value">${new Date(rating.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="button-row">
                    <button class="ripple danger-button" onclick="deleteRating('${rating._id}')">
                        <span class="material-symbols-outlined">delete</span>
                        Delete Rating
                    </button>
                    ${rating.imdbId ? `
                    <button class="ripple secondary-button" onclick="openExternalLink('https://www.imdb.com/title/${rating.imdbId}/')">
                        <span class="material-symbols-outlined">open_in_new</span>
                        View on IMDb
                    </button>` : ''}
                </div>
            </div>
        `;
        
        // Display modal
        const detailModal = document.getElementById('detailModal');
        if (!detailModal) {
            // Create modal if it doesn't exist
            const modal = document.createElement('div');
            modal.id = 'detailModal';
            modal.className = 'modal';
            modal.innerHTML = `<div class="modal-content">${modalContent}</div>`;
            document.body.appendChild(modal);
            
            // Add close functionality
            const closeBtn = modal.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Close when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            modal.style.display = 'block';
        } else {
            // Update existing modal
            detailModal.querySelector('.modal-content').innerHTML = modalContent;
            
            // Add close functionality
            const closeBtn = detailModal.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                detailModal.style.display = 'none';
            });
            
            detailModal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error showing rating details:', error);
        showToast(`Error: ${error.message}`);
    }
}

/**
 * Delete a rating
 * @param {string} ratingId - Rating ID
 */
async function deleteRating(ratingId) {
    try {
        if (!confirm('Are you sure you want to delete this rating?')) {
            return;
        }
        
        // Call API to delete the rating
        await apiClient.delete(`/ratings/${ratingId}`);
        
        // Close modal
        const detailModal = document.getElementById('detailModal');
        if (detailModal) {
            detailModal.style.display = 'none';
        }
        
        // Refresh ratings list
        await fetchUserRatings();
        
        showToast('Rating deleted successfully');
    } catch (error) {
        console.error('Error deleting rating:', error);
        showToast(`Error: ${error.message}`);
    }
}

/**
 * Search for media on OMDB
 */
async function searchMedia() {
    // Implementation to be added
    // This will handle searching for media and adding ratings
}
/**
 * Display user ratings in the UI
 */
function displayUserRatings(ratings) {
    const userRatingsDiv = document.getElementById('userRatings');
    if (!userRatingsDiv) return;
    
    if (ratings.length === 0) {
        userRatingsDiv.innerHTML = '<p class="placeholder-text">No ratings found. Search for movies to rate them. 🎬</p>';
        return;
    }
    
    // Debug output for media types
    console.log('Media types in data:', ratings.map(m => ({title: m.title, type: m.mediaType})));
    
    let html = '';
    ratings.forEach(movie => {
        // Get the badge color based on media type
        let typeBadgeColor = '';
        let typeIcon = '';
        let typeLabel = 'Other';
        
        switch(movie.mediaType) {
            case 'movie': 
                typeBadgeColor = 'var(--foam)';
                typeIcon = '🎬';
                typeLabel = 'Movie';
                break;
            case 'series': 
                typeBadgeColor = 'var(--iris)';
                typeIcon = '📺';
                typeLabel = 'Series';
                break;
            case 'episode': 
                typeBadgeColor = 'var(--love)';
                typeIcon = '🎞️';
                typeLabel = 'Episode';
                break;
            case 'game': 
                typeBadgeColor = 'var(--gold)';
                typeIcon = '🎮';
                typeLabel = 'Game';
                break;
            case 'anime': 
                typeBadgeColor = 'var(--pine)';
                typeIcon = '🌸';
                typeLabel = 'Anime';
                break;
            default: 
                typeBadgeColor = 'var(--subtle)';
                typeIcon = '🔍';
                typeLabel = movie.mediaType || 'Other';
        }
        
        // Create IMDb rating bubble
        const imdbRatingBubble = movie.imdbRating ? 
            `<div class="imdb-rating">
                <span class="imdb-score">${movie.imdbRating}</span>
                ${movie.imdbVotes ? `<span class="imdb-votes">${formatVotes(movie.imdbVotes)}</span>` : ''}
            </div>` : '';
        
        // Create movie card HTML with poster container and rating bubble
        html += `
            <div class="movie-card" data-type="${movie.mediaType || 'unknown'}">
                <div class="poster-container">
                    <img src="${movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                         alt="${movie.title}" class="movie-poster">
                    ${imdbRatingBubble}
                </div>
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-year">${movie.year || 'N/A'}</div>
                    <div class="movie-meta">
                        <span class="movie-rating">${movie.rating}/10 ⭐</span>
                        <span class="media-type-badge" style="background-color: ${typeBadgeColor}">
                            ${typeIcon} ${typeLabel}
                        </span>
                    </div>
                    <button class="rate-button ripple" onclick="openRatingModal('${movie.imdbId}', '${movie.title.replace(/'/g, "\\'")}', '${movie.year}', '${movie.poster}')">
                        <span class="material-symbols-outlined">edit</span>
                        Rate
                    </button>
                </div>
            </div>
        `;
    });
    
    userRatingsDiv.innerHTML = html;
    addRippleEffect();
}

/**
 * Format IMDb votes number (e.g. 1200000 -> 1.2M)
 */
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
 * Fetch user ratings from the server
 */
async function loadUserRatings() {
    const userRatingsDiv = document.getElementById('userRatings');
    if (!userRatingsDiv) return;
    
    try {
        showLoading(userRatingsDiv);
        
        // Get filter values
        const ratingFilter = document.getElementById('ratingFilter')?.value || 'all';
        const sortOrder = document.getElementById('sortOrder')?.value || 'rating_desc';
        const mediaTypeFilter = document.getElementById('mediaTypeFilter')?.value || 'all';
        
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
        
        // Add parameter to get all results (no limit)
        params.append('limit', 'all');
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        console.log('Loading all ratings from:', endpoint);
        
        // Use the API client for the request
        const ratings = await ratingsApiClient.get(endpoint);
        console.log(`Received ${ratings.length} ratings`);
        userRatingsData = ratings;
        displayUserRatings(ratings);
    } catch (error) {
        console.error('Error:', error);
        userRatingsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}
// filepath: /home/madlen/bots/tgchatbot-api/frontend/js/ratings.js
/**
 * Ratings Module
 * Handles user movie ratings
 */

// Reference to API client (ensure api-client.js is loaded before this file)
const ratingsApiClient = window.apiClient || {};

// State variables
let selectedImdbId = '';
let currentRating = 5;
let userRatingsData = [];

/**
 * Initialize ratings functionality
 */
function initRatings() {
    console.log('Initializing ratings functionality');
    
    // Initialize star rating system
    const ratingStars = document.querySelectorAll('input[name="rating"]');
    const ratingValueDisplay = document.querySelector('.rating-value');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.value);
            console.log('Rating changed to:', currentRating);
            ratingValueDisplay.textContent = `${currentRating}/10`;
        });
    });
    
    // Initialize submit button
    const submitRatingBtn = document.getElementById('submitRating');
    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', submitRating);
    }
    
    // Initialize filter controls
    const ratingFilterSelect = document.getElementById('ratingFilter');
    const mediaTypeFilterSelect = document.getElementById('mediaTypeFilter');
    const sortOrderSelect = document.getElementById('sortOrder');
    
    if (ratingFilterSelect) {
        ratingFilterSelect.addEventListener('change', applyFilters);
    }
    
    if (mediaTypeFilterSelect) {
        mediaTypeFilterSelect.addEventListener('change', applyFilters);
    }
    
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', applyFilters);
    }
    
    // Initialize modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Load user ratings initially
    loadUserRatings();
    
    console.log('Ratings functionality initialized');
}

/**
 * Submit a movie rating
 */
async function submitRating() {
    try {
        const selectedImdbId = window.selectedImdbId;
        console.log(`Submitting rating: ${window.currentRating}/10 for movie ID: ${selectedImdbId}`);
        
        if (!selectedImdbId) {
            showToast('No movie selected');
            return;
        }
        
        // Use the API client to submit rating
        await window.apiClient.post('/ratings/add-rating', {
            userId: window.currentUserId,
            imdbId: selectedImdbId,
            rating: window.currentRating
        });
        
        // Close modal
        const ratingModal = document.getElementById('ratingModal');
        if (ratingModal) {
            ratingModal.style.display = 'none';
        }
        
        // Refresh user ratings
        await loadUserRatings();
        
        // Show success message
        if (window.showToast) {
            window.showToast('Rating successfully added! 🌟');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        if (window.showToast) {
            window.showToast(`Error: ${error.message}`);
        }
    }
}


/**
 * Load user ratings
 */
async function loadUserRatings() {
    const userRatingsDiv = document.getElementById('userRatings');
    if (!userRatingsDiv) return;
    
    try {
        if (window.showLoading) {
            window.showLoading(userRatingsDiv);
        } else {
            userRatingsDiv.innerHTML = '<div class="loading"></div>';
        }
        
        // Get filter values
        const ratingFilter = document.getElementById('ratingFilter')?.value || 'all';
        const sortOrder = document.getElementById('sortOrder')?.value || 'rating_desc';
        const mediaTypeFilter = document.getElementById('mediaTypeFilter')?.value || 'all';
        
        let endpoint = `/ratings/user/${window.currentUserId}`;
        
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
        
        console.log('Loading ratings from:', endpoint);
        
        // Use the API client for the request
        const ratings = await window.apiClient.get(endpoint);
        console.log(`Received ${ratings.length} ratings`);
        window.userRatingsData = ratings;
        displayUserRatings(ratings);
    } catch (error) {
        console.error('Error:', error);
        userRatingsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

/**
 * Display user ratings in the UI
 */
function displayUserRatings(ratings) {
    const userRatingsDiv = document.getElementById('userRatings');
    if (!userRatingsDiv) return;
    
    if (!ratings || ratings.length === 0) {
        userRatingsDiv.innerHTML = '<p class="placeholder-text">No ratings found. Search for movies to rate them. 🎬</p>';
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
        
        // Create movie card HTML
        html += `
            <div class="movie-card">
                <img src="${movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-year">${movie.year || 'N/A'}</div>
                    <div class="movie-meta">
                        <span class="movie-rating">${movie.rating}/10 ⭐</span>
                        <span class="media-type-badge" style="background-color: ${typeBadgeColor}">
                            ${typeIcon} ${movie.mediaType === 'movie' ? 'Movie' : 
                              movie.mediaType === 'series' ? 'Series' : 
                              movie.mediaType === 'episode' ? 'Episode' : 
                              movie.mediaType === 'game' ? 'Game' : 'Other'}
                        </span>
                    </div>
                    <button class="rate-button ripple" onclick="openRatingModal('${movie.imdbId}', '${movie.title.replace(/'/g, "\\'")}', '${movie.year}', '${movie.poster}')">
                        <span class="material-symbols-outlined">edit</span>
                        Rate
                    </button>
                </div>
            </div>
        `;
    });
    
    userRatingsDiv.innerHTML = html;
    
    // Apply ripple effect to new buttons
    if (window.addRippleEffect) {
        window.addRippleEffect();
    }
}

/**
 * Open the rating modal for a movie
 */
function openRatingModal(imdbId, title, year, poster) {
    console.log('Opening rating modal for:', title, imdbId);
    
    selectedImdbId = imdbId;
    
    // Find modal elements
    const ratingModal = document.getElementById('ratingModal');
    const movieInfoDiv = document.getElementById('movieInfo');
    const ratingValueDisplay = document.querySelector('.rating-value');
    
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
    
    // Uncheck all stars
    document.querySelectorAll('input[name="rating"]').forEach(star => {
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

/**
 * Submit a movie rating
 */
async function submitRating() {
    try {
        console.log(`Submitting rating: ${currentRating}/10 for movie ID: ${selectedImdbId}`);
        
        // Use the API client to submit rating with JSON body
        await ratingsApiClient.post('/ratings/add-rating', {
            userId: currentUserId,
            imdbId: selectedImdbId,
            rating: currentRating
        });
        
        // Close modal
        document.getElementById('ratingModal').style.display = 'none';
        
        // Refresh user ratings
        await loadUserRatings();
        
        // Show success message
        showToast('Rating successfully added! 🌟');
    } catch (error) {
        console.error('Error submitting rating:', error);
        showToast(`Error: ${error.message}`);
    }
}

/**
 * Apply filters to ratings
 */
function applyFilters() {
    console.log('Applying filters to ratings');
    loadUserRatings();
}

// Export functions to global scope
window.initRatings = initRatings;
window.loadUserRatings = loadUserRatings;
window.applyFilters = applyFilters;
window.submitRating = submitRating;
window.displayUserRatings = displayUserRatings;