// TensorFlow.js ve model yükleme için gerekli fonksiyonlar
let weatherModel = null;

// Hava durumu modelini yükle
async function loadWeatherModel() {
    try {
        const model = await tf.loadLayersModel('assets/data/weather_model.h5');
        weatherModel = model;
        return model;
    } catch (error) {
        console.error('Model yüklenirken hata oluştu:', error);
        return null;
    }
}

// Hava durumuna göre mevsim tahmini yap
async function predictSeason(temperature, humidity, windSpeed) {
    try {
        if (!weatherModel) await loadWeatherModel();
        if (!weatherModel) return temperature >= 20 ? 'yazlik' : 'kislik';
        const input = tf.tensor2d([[temperature, humidity, windSpeed]]);
        const prediction = weatherModel.predict(input);
        const result = await prediction.data();
        input.dispose();
        prediction.dispose();
        return result[0] > 0.5 ? 'yazlik' : 'kislik';
    } catch (error) {
        return temperature >= 20 ? 'yazlik' : 'kislik';
    }
}

// Bir klasörün ve alt klasörlerinin içindeki tüm resimleri getir
async function getAllImagesRecursive(folderPath) {
    let images = [];
    try {
        const response = await fetch(folderPath);
        if (!response.ok) return [];
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href === '../') continue;
            if (href.match(/\.(jpg|jpeg|png|gif)$/i)) {
                images.push(folderPath + '/' + href);
            } else if (!href.includes('.')) {
                // Alt klasör ise recursive tara
                const subImages = await getAllImagesRecursive(folderPath + '/' + href.replace('/', ''));
                images = images.concat(subImages);
            }
        }
    } catch (e) {
        console.error('Resimler alınırken hata:', e);
    }
    return images;
}

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

// Tüm kıyafetleri göster
async function displayClothes() {
    const categories = ['upperwear', 'bottomwear', 'one-piece', 'footwear', 'accessories'];
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '<div class="loading">Yükleniyor...</div>';
    await loadWeatherModel();
    const tempElement = document.querySelector('.temp-value');
    const humidityElement = document.querySelector('.detail-item:nth-child(2) span');
    const windElement = document.querySelector('.detail-item:nth-child(1) span');
    let temperature = 15, humidity = 50, windSpeed = 10;
    if (tempElement) temperature = parseInt(tempElement.textContent);
    if (humidityElement) humidity = parseInt(humidityElement.textContent);
    if (windElement) windSpeed = parseInt(windElement.textContent);
    const season = await predictSeason(temperature, humidity, windSpeed);
    let allProducts = [];
    window.wardrobeData = {};
    for (const category of categories) {
        const categoryPath = `assets/data/clustered_output/${season}/${category}`;
        const images = await getAllImagesRecursive(categoryPath);
        window.wardrobeData[category] = images;
        images.forEach(imagePath => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.category = category;
            const imageName = imagePath.split('/').pop().replace(/\.[^/.]+$/, '');
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${imagePath}" alt="${imageName}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
                </div>
                <div class="product-details">
                    <h3 class="product-title">${imageName}</h3>
                    <div class="product-meta">
                        <p>Kategori: ${getCategoryName(category)}</p>
                    </div>
                </div>
            `;
            allProducts.push(card);
        });
    }
    if (allProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">Henüz kıyafet eklenmemiş.</div>';
        return;
    }
    productsGrid.innerHTML = '';
    allProducts.forEach(card => productsGrid.appendChild(card));
    // Filtre butonlarını göster
    const filterButtons = document.querySelector('.category-filters');
    if (filterButtons) filterButtons.style.display = '';
    const filterBtnList = document.querySelectorAll('.filter-btn');
    filterBtnList.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            filterBtnList.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
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

// Kombin önerisi oluştur (her kategoriden random bir resim)
async function generateOutfitSuggestion() {
    const categories = ['upperwear', 'bottomwear', 'one-piece', 'footwear', 'accessories'];
    const tempElement = document.querySelector('.temp-value');
    const humidityElement = document.querySelector('.detail-item:nth-child(2) span');
    const windElement = document.querySelector('.detail-item:nth-child(1) span');
    let temperature = 15, humidity = 50, windSpeed = 10;
    if (tempElement) temperature = parseInt(tempElement.textContent);
    if (humidityElement) humidity = parseInt(humidityElement.textContent);
    if (windElement) windSpeed = parseInt(windElement.textContent);
    const season = await predictSeason(temperature, humidity, windSpeed);
    let outfit = [];
    for (const category of categories) {
        const categoryPath = `assets/data/clustered_output/${season}/${category}`;
        const images = await getAllImagesRecursive(categoryPath);
        if (images.length > 0) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            outfit.push({imagePath: randomImage, name: getCategoryName(category)});
        }
    }
    return outfit;
}

// Kombin önerisi popup'ını güncelle
async function updateOutfitPopup() {
    const outfitPopup = document.getElementById('outfitPopup');
    const outfitItemsGrid = outfitPopup.querySelector('.outfit-items-grid');
    if (!outfitItemsGrid) return;
    outfitItemsGrid.innerHTML = '<div class="loading">Kombin hazırlanıyor...</div>';
    const outfit = await generateOutfitSuggestion();
    if (!outfit || outfit.length === 0) {
        outfitItemsGrid.innerHTML = '<div class="error">Kombin oluşturulamadı.</div>';
        return;
    }
    outfitItemsGrid.innerHTML = '';
    outfit.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'outfit-item';
        itemDiv.innerHTML = `
            <img src="${item.imagePath}" alt="${item.name}" class="outfit-image">
            <span>${item.name}</span>
        `;
        outfitItemsGrid.appendChild(itemDiv);
    });
}

// Sayfa yüklendiğinde
// Kıyafetleri göster ve kombin önerisi butonunu ayarla
// Filtre butonlarını gizle

document.addEventListener('DOMContentLoaded', () => {
    displayClothes();
    const outfitBtn = document.querySelector('.landing-outfit-btn');
    if (outfitBtn) {
        outfitBtn.addEventListener('click', async () => {
            const outfitPopup = document.getElementById('outfitPopup');
            outfitPopup.style.display = 'block';
            await updateOutfitPopup();
        });
    }
    const closePopup = document.querySelector('.close-popup');
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            const outfitPopup = document.getElementById('outfitPopup');
            outfitPopup.style.display = 'none';
        });
    }
}); 