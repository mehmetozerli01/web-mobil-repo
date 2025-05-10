// Function to load images from a specific category
async function loadCategoryImages(category) {
    const categoryPath = `assets/data/clothes/${category}`;
    try {
        const response = await fetch(categoryPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${category} images`);
        }
        const files = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(files, 'text/html');
        
        // Get all subdirectories
        const subdirs = Array.from(doc.querySelectorAll('a'))
            .filter(a => !a.href.match(/\.(jpg|jpeg|png|gif)$/i))
            .map(a => a.href);
        
        let allImages = [];
        
        // Load images from each subdirectory
        for (const subdir of subdirs) {
            try {
                const subdirResponse = await fetch(subdir);
                if (subdirResponse.ok) {
                    const subdirFiles = await subdirResponse.text();
                    const subdirDoc = parser.parseFromString(subdirFiles, 'text/html');
                    const images = Array.from(subdirDoc.querySelectorAll('a'))
                        .filter(a => a.href.match(/\.(jpg|jpeg|png|gif)$/i))
                        .map(a => a.href);
                    allImages = allImages.concat(images);
                }
            } catch (error) {
                console.error(`Error loading subdirectory ${subdir}:`, error);
            }
        }
        
        return allImages;
    } catch (error) {
        console.error(`Error loading ${category} images:`, error);
        return [];
    }
}

// Function to create product card
function createProductCard(imagePath, category) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = category;
    
    // Extract subcategory from path
    const pathParts = imagePath.split('/');
    const subcategory = pathParts[pathParts.length - 2];
    const imageName = pathParts[pathParts.length - 1].replace(/\.[^/.]+$/, '');
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${imagePath}" 
                 alt="${imageName}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
        </div>
        <div class="product-details">
            <h3 class="product-title">${imageName}</h3>
            <div class="product-meta">
                <p>Kategori: ${getCategoryName(category)}</p>
                <p>Alt Kategori: ${getSubcategoryName(subcategory)}</p>
            </div>
        </div>
    `;
    
    return card;
}

// Function to get category name in Turkish
function getCategoryName(category) {
    const categoryNames = {
        'upperwear': 'Üst Giyim',
        'bottomwear': 'Alt Giyim',
        'one-piece': 'Tek Parça',
        'footwear': 'Ayakkabı',
        'accessories': 'Aksesuar'
    };
    return categoryNames[category] || category;
}

// Function to get subcategory name in Turkish
function getSubcategoryName(subcategory) {
    const subcategoryNames = {
        'tshirt': 'Tişört',
        'shirt': 'Gömlek',
        'jacket': 'Ceket',
        'pants': 'Pantolon',
        'shorts': 'Şort',
        'skirt': 'Etek',
        'dress': 'Elbise',
        'sneakers': 'Spor Ayakkabı',
        'boots': 'Bot',
        'hat': 'Şapka',
        'bag': 'Çanta'
    };
    return subcategoryNames[subcategory] || subcategory;
}

// Function to display all clothes
async function displayClothes() {
    const categories = ['upperwear', 'bottomwear', 'one-piece', 'footwear', 'accessories'];
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) {
        console.error('Products grid not found');
        return;
    }
    
    productsGrid.innerHTML = '<div class="loading">Yükleniyor...</div>';
    
    let allProducts = [];
    
    for (const category of categories) {
        const images = await loadCategoryImages(category);
        console.log(`Loaded ${images.length} images from ${category}`);
        
        for (const imagePath of images) {
            const card = createProductCard(imagePath, category);
            allProducts.push(card);
        }
    }
    
    if (allProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">Henüz kıyafet eklenmemiş.</div>';
        return;
    }
    
    productsGrid.innerHTML = '';
    allProducts.forEach(card => productsGrid.appendChild(card));
    
    // Add click event listeners to filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const products = document.querySelectorAll('.product-card');
            products.forEach(product => {
                if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
}

// Load clothes when the page loads
document.addEventListener('DOMContentLoaded', displayClothes); 