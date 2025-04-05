// Fixed products.js - resolving currentUserId reference issue
/**
 * Products Module
 * Handles product tracking functionality
 */

/**
 * Initialize products functionality
 */
function initProducts() {
    console.log('Initializing products functionality');
    
    // Set up add product functionality
    const addProductFab = document.getElementById('addProductFab');
    const addProductForm = document.getElementById('addProductForm');
    
    if (addProductFab) {
        addProductFab.addEventListener('click', openProductModal);
    }
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', addProduct);
    }
    
    // Load tracked products only if we have a user ID
    if (window.currentUserId) {
        fetchUserProducts().catch(err => {
            console.error('Error loading products:', err);
        });
    } else {
        console.warn('Cannot fetch products: currentUserId is not defined');
    }
    
    console.log('Products functionality initialized');
}

/**
 * Fetch all tracked products for the current user
 */
async function fetchUserProducts() {
    try {
        const userProductsDiv = document.getElementById('userProducts');
        if (!userProductsDiv) return;
        
        // Use global currentUserId
        if (!window.currentUserId) {
            userProductsDiv.innerHTML = '<p class="error-message">User ID unavailable</p>';
            return;
        }
        
        // Show loading indicator
        if (window.showLoading) {
            window.showLoading(userProductsDiv);
        } else {
            userProductsDiv.innerHTML = '<div class="loading"></div>';
        }
        
        // Use the API client
        const products = await window.apiClient.get(`/tracker/user/${window.currentUserId}`);
        displayUserProducts(products);
    } catch (error) {
        console.error('Error:', error);
        const userProductsDiv = document.getElementById('userProducts');
        if (userProductsDiv) {
            userProductsDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }
}

/**
 * Display user tracked products
 * @param {Array} products - Array of tracked products
 */
function displayUserProducts(products) {
    const userProductsDiv = document.getElementById('userProducts');
    if (!userProductsDiv) return;
    
    if (!products || products.length === 0) {
        userProductsDiv.innerHTML = '<p class="placeholder-text">No tracked products found. Add some using the + button. 🛍️</p>';
        return;
    }
    
    // Create a container for staggered scrolling if multiple products
    let html = '<div class="staggered-scroll-container">';
    
    products.forEach(product => {
        // Determine price display based on sale status
        let priceDisplay = '';
        
        if (product.status === 'sale') {
            // Product is on sale
            priceDisplay = `
                <div class="product-price sale">
                    <span class="original-price">${formatPrice(product.price)}</span>
                    <span class="sale-price">${formatPrice(product.salePrice)}</span>
                    <span class="sale-badge">-${product.salePercent}%</span>
                </div>
            `;
        } else if (product.status === 'free') {
            // Free product
            priceDisplay = `
                <div class="product-price free">
                    <span class="free-label">Free</span>
                </div>
            `;
        } else {
            // Regular price
            priceDisplay = `
                <div class="product-price">
                    <span>${formatPrice(product.price)}</span>
                </div>
            `;
        }
        
        html += `
            <div class="staggered-scroll-item">
                <div class="product-item scroll-reveal" data-id="${product._id}" onclick="showProductDetails('${product._id}')">
                    <div class="product-info">
                        <div class="product-name">${product.productName}</div>
                        <div class="product-category">${product.category || 'Uncategorized'}</div>
                    </div>
                    ${priceDisplay}
                    <div class="product-link">
                        ${product.url ? `<a href="#" onclick="openExternalLink('${product.url}'); event.stopPropagation(); return false;">
                            <span class="material-symbols-outlined">open_in_new</span>
                        </a>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    userProductsDiv.innerHTML = html;
    
    // Initialize scroll reveal for new elements - check if function exists
    if (typeof setupScrollReveal === 'function') {
        setupScrollReveal();
    }
}

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
function formatPrice(price) {
    if (price === null || price === undefined) return 'N/A';
    
    // Format with locale and currency
    try {
        return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
            minimumFractionDigits: 2
        }).format(price);
    } catch (error) {
        console.warn('Price formatting error:', error);
        return price.toFixed(2) + ' ₴';
    }
}

/**
 * Open product modal to add a new product
 */
function openProductModal() {
    if (!window.currentUserId) {
        if (window.showToast) {
            window.showToast('User ID unavailable');
        }
        return;
    }
    
    // Reset form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.reset();
    }
    
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.style.display = 'block';
    }
}

/**
 * Add a product from form submission
 * @param {Event} e - Form submit event
 */
async function addProduct(e) {
    e.preventDefault();
    
    if (!window.currentUserId) {
        if (window.showToast) {
            window.showToast('User ID unavailable');
        }
        return;
    }
    
    const urlInput = document.getElementById('productUrl');
    if (!urlInput) {
        if (window.showToast) {
            window.showToast('Product URL input not found');
        }
        return;
    }
    
    const url = urlInput.value.trim();
    if (!url) {
        if (window.showToast) {
            window.showToast('Please enter a product URL');
        }
        return;
    }
    
    // Show loading indicator
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.innerHTML : '';
    if (submitButton) {
        submitButton.innerHTML = '<span class="loading-spinner"></span>';
        submitButton.disabled = true;
    }
    
    try {
        // Simple URL validation
        if (!url.startsWith('http')) {
            throw new Error('Please enter a valid URL starting with http:// or https://');
        }
        
        // Submit to API
        const response = await window.apiClient.post('/tracker/add', {
            userId: window.currentUserId,
            url: url
        });
        
        // Check if the product is already on sale
        if (response.alreadyOnSale) {
            // Show special notification for already on sale products
            const productModal = document.getElementById('productModal');
            if (productModal) {
                productModal.style.display = 'none';
            }
            
            // Display a special toast or notification for sales
            if (window.showToast) {
                window.showToast(`Product "${response.saleDetails.productName}" is already on sale: ${response.saleDetails.salePercent}% off!`);
            }
            
            e.target.reset();
            return;
        }
        
        // Reset form and close modal
        e.target.reset();
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.style.display = 'none';
        }
        
        // Refresh product list
        await fetchUserProducts();
        
        // Show success message
        if (window.showToast) {
            window.showToast('Product successfully added to tracking! 🛍️');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        if (window.showToast) {
            window.showToast(`Error: ${error.message}`);
        }
    } finally {
        // Restore button
        if (submitButton) {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }
}

// Export functions to global scope
window.initProducts = initProducts;
window.fetchUserProducts = fetchUserProducts;
window.openProductModal = openProductModal;
window.addProduct = addProduct;
window.showProductDetails = showProductDetails;
window.formatPrice = formatPrice;

// Define this function if not already defined
if (typeof showProductDetails !== 'function') {
    window.showProductDetails = function(productId) {
        console.log('Product details requested for:', productId);
        // Implement product details display logic here
        if (window.showToast) {
            window.showToast('Product details feature coming soon');
        }
    };
}