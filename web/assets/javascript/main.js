// Modal işlemleri
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const closeBtn = document.querySelector('.close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    // Modal'ı aç
    function openModal() {
        modal.style.display = 'block';
    }

    // Modal'ı kapat
    function closeModal() {
        modal.style.display = 'none';
    }

    // Tab değiştirme
    function switchTab(tabName) {
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        authForms.forEach(form => {
            form.classList.add('hidden');
            if (form.id === tabName + 'Form') {
                form.classList.remove('hidden');
            }
        });
    }

    // Event Listeners
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
        switchTab('login');
    });

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
        switchTab('register');
    });

    closeBtn.addEventListener('click', closeModal);

    // Modal dışına tıklandığında kapat
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Tab butonları için event listener
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Form submit işlemleri
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // Giriş işlemleri burada yapılacak
        console.log('Giriş yapılıyor...');
    });

    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // Kayıt işlemleri burada yapılacak
        console.log('Kayıt yapılıyor...');
    });
});

// Hava durumu işlemleri
const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";

// Şehirleri `cities.json` dosyasından yükle
async function loadCities() {
    try {
        const response = await fetch("assets/data/cities.json");
        const cities = await response.json();
        
        // Ana sayfa ve detaylı hava durumu için select elementlerini doldur
        const citySelects = ["citySelect", "landingCitySelect"];
        citySelects.forEach(selectId => {
            const citySelect = document.getElementById(selectId);
            if (citySelect) {
                cities.forEach(city => {
                    const option = document.createElement("option");
                    option.value = JSON.stringify({ lat: city.lat, lon: city.lon });
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error("Şehirler yüklenirken hata oluştu:", error);
    }
}

// API'den hava durumu bilgisi çek
async function fetchWeather(event, isLanding = false) {
    if (event) {
        event.preventDefault();
    }

    const selectId = isLanding ? "landingCitySelect" : "citySelect";
    const citySelect = document.getElementById(selectId);
    
    if (!citySelect) {
        console.error("City select element not found:", selectId);
        return;
    }

    console.log("Selected city value:", citySelect.value);
    const selectedCity = JSON.parse(citySelect.value);

    if (!selectedCity) {
        alert("Lütfen bir şehir seçin.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${apiKey}&units=metric&lang=tr`;
    console.log("Fetching weather from URL:", url);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Weather data received:", data);

        if (isLanding) {
            // Ana sayfa hava durumu güncelleme
            document.getElementById("landingTemperature").textContent = `${Math.round(data.main.temp)}°`;
            document.getElementById("landingCityName").textContent = data.name;
            document.getElementById("landingWeatherDescription").textContent = data.weather[0].description;
            
            // Hava durumuna göre ikon güncelleme
            const weatherIcon = document.getElementById("landingWeatherIcon");
            const weatherCode = data.weather[0].id;
            updateWeatherIcon(weatherIcon, weatherCode);
        } else {
            // Detaylı hava durumu bölümü güncelleme
            const weatherResult = document.getElementById("weatherResult");
            if (!weatherResult) {
                console.error("Weather result element not found");
                return;
            }
            
            // Ana hava durumu bilgileri
            const tempValue = weatherResult.querySelector('.temp-value');
            const weatherDesc = weatherResult.querySelector('.weather-desc');
            const location = weatherResult.querySelector('.location');
            
            if (tempValue && weatherDesc && location) {
                tempValue.textContent = `${Math.round(data.main.temp)}°`;
                weatherDesc.textContent = data.weather[0].description;
                location.textContent = data.name;

                // Detaylı bilgiler
                const details = weatherResult.querySelectorAll('.detail-item span');
                if (details.length >= 3) {
                    details[0].textContent = `${data.wind.speed} km/s`; // Rüzgar hızı
                    details[1].textContent = `${data.main.humidity}%`; // Nem
                    details[2].textContent = `${Math.round(data.main.feels_like)}°`; // Hissedilen sıcaklık
                }

                // Hava durumuna göre ikon güncelleme
                const weatherIcon = weatherResult.querySelector('.weather-header i');
                if (weatherIcon) {
                    const weatherCode = data.weather[0].id;
                    updateWeatherIcon(weatherIcon, weatherCode);
                }

                // Hava durumu değiştiğinde kıyafetleri güncelle
                if (window.wardrobeData) {
                    updateOutfitCards();
                }
            } else {
                console.error("Weather elements not found in weatherResult");
            }
        }
    } catch (error) {
        console.error("Weather fetch error:", error);
        const errorMessage = "Hava durumu bilgisi alınamadı.";
        if (isLanding) {
            document.getElementById("landingWeatherError").textContent = errorMessage;
        } else {
            const weatherResult = document.getElementById("weatherResult");
            if (weatherResult) {
                weatherResult.innerHTML = `<div class="weather-error-message">${errorMessage}</div>`;
            }
        }
    }
}

// Hava durumuna göre ikon güncelleme
function updateWeatherIcon(iconElement, weatherCode) {
    let iconClass = "fa-cloud-sun"; // Varsayılan ikon

    if (weatherCode >= 200 && weatherCode < 300) {
        iconClass = "fa-bolt"; // Gök gürültülü
    } else if (weatherCode >= 300 && weatherCode < 400) {
        iconClass = "fa-cloud-rain"; // Yağmurlu
    } else if (weatherCode >= 500 && weatherCode < 600) {
        iconClass = "fa-cloud-showers-heavy"; // Şiddetli yağmur
    } else if (weatherCode >= 600 && weatherCode < 700) {
        iconClass = "fa-snowflake"; // Karlı
    } else if (weatherCode >= 700 && weatherCode < 800) {
        iconClass = "fa-smog"; // Sisli
    } else if (weatherCode === 800) {
        iconClass = "fa-sun"; // Açık
    } else if (weatherCode > 800) {
        iconClass = "fa-cloud"; // Bulutlu
    }

    iconElement.className = `fas ${iconClass} weather-main-icon`;
}

// Rastgele kombin oluşturma fonksiyonu
function generateRandomOutfit(wardrobeData) {
    const outfit = {
        upperwear: null,
        bottomwear: null,
        footwear: null,
        accessories: null
    };

    // Her kategoriden rastgele bir parça seç
    if (wardrobeData.upperwear && wardrobeData.upperwear.length > 0) {
        outfit.upperwear = wardrobeData.upperwear[Math.floor(Math.random() * wardrobeData.upperwear.length)];
    }
    if (wardrobeData.bottomwear && wardrobeData.bottomwear.length > 0) {
        outfit.bottomwear = wardrobeData.bottomwear[Math.floor(Math.random() * wardrobeData.bottomwear.length)];
    }
    if (wardrobeData.footwear && wardrobeData.footwear.length > 0) {
        outfit.footwear = wardrobeData.footwear[Math.floor(Math.random() * wardrobeData.footwear.length)];
    }
    if (wardrobeData.accessories && wardrobeData.accessories.length > 0) {
        outfit.accessories = wardrobeData.accessories[Math.floor(Math.random() * wardrobeData.accessories.length)];
    }

    return outfit;
}

// Kombin kartlarını güncelleme fonksiyonu
function updateOutfitCards() {
    const outfitCards = document.querySelectorAll('.outfit-card');
    
    outfitCards.forEach(card => {
        const outfitType = card.querySelector('.outfit-header h2').textContent;
        const outfitItems = card.querySelector('.outfit-items');
        const outfitBtn = card.querySelector('.outfit-btn');
        
        if (!outfitItems) return;
        
        // Gardırop verilerini al
        const wardrobeData = {
            upperwear: window.wardrobeData?.upperwear || [],
            bottomwear: window.wardrobeData?.bottomwear || [],
            footwear: window.wardrobeData?.footwear || [],
            accessories: window.wardrobeData?.accessories || []
        };

        // Kombin tipine göre uygun kıyafetleri seç
        let selectedOutfit;
        switch(outfitType) {
            case 'Günlük Kombin':
                selectedOutfit = generateRandomOutfit(wardrobeData);
                break;
            case 'Spor Kombin':
                selectedOutfit = generateRandomOutfit(wardrobeData);
                break;
            case 'Resmi Kombin':
                selectedOutfit = generateRandomOutfit(wardrobeData);
                break;
            default:
                selectedOutfit = generateRandomOutfit(wardrobeData);
        }

        // Kombin kartını güncelle
        outfitItems.innerHTML = '';

        // Üst giyim
        if (selectedOutfit.upperwear) {
            const upperwearItem = document.createElement('div');
            upperwearItem.className = 'outfit-item';
            upperwearItem.innerHTML = `
                <img src="${selectedOutfit.upperwear.imagePath}" alt="${selectedOutfit.upperwear.name}" class="outfit-image">
                <span>${selectedOutfit.upperwear.name}</span>
            `;
            outfitItems.appendChild(upperwearItem);
        }

        // Alt giyim
        if (selectedOutfit.bottomwear) {
            const bottomwearItem = document.createElement('div');
            bottomwearItem.className = 'outfit-item';
            bottomwearItem.innerHTML = `
                <img src="${selectedOutfit.bottomwear.imagePath}" alt="${selectedOutfit.bottomwear.name}" class="outfit-image">
                <span>${selectedOutfit.bottomwear.name}</span>
            `;
            outfitItems.appendChild(bottomwearItem);
        }

        // Ayakkabı
        if (selectedOutfit.footwear) {
            const footwearItem = document.createElement('div');
            footwearItem.className = 'outfit-item';
            footwearItem.innerHTML = `
                <img src="${selectedOutfit.footwear.imagePath}" alt="${selectedOutfit.footwear.name}" class="outfit-image">
                <span>${selectedOutfit.footwear.name}</span>
            `;
            outfitItems.appendChild(footwearItem);
        }

        // Aksesuar
        if (selectedOutfit.accessories) {
            const accessoryItem = document.createElement('div');
            accessoryItem.className = 'outfit-item';
            accessoryItem.innerHTML = `
                <img src="${selectedOutfit.accessories.imagePath}" alt="${selectedOutfit.accessories.name}" class="outfit-image">
                <span>${selectedOutfit.accessories.name}</span>
            `;
            outfitItems.appendChild(accessoryItem);
        }

        // "Bu Kombini Seç" butonuna tıklama olayı ekle
        if (outfitBtn) {
            outfitBtn.addEventListener('click', () => {
                // Yeni rastgele kombin oluştur
                const newOutfit = generateRandomOutfit(wardrobeData);
                
                // Kombin kartını güncelle
                outfitItems.innerHTML = '';
                
                // Üst giyim
                if (newOutfit.upperwear) {
                    const upperwearItem = document.createElement('div');
                    upperwearItem.className = 'outfit-item';
                    upperwearItem.innerHTML = `
                        <img src="${newOutfit.upperwear.imagePath}" alt="${newOutfit.upperwear.name}" class="outfit-image">
                        <span>${newOutfit.upperwear.name}</span>
                    `;
                    outfitItems.appendChild(upperwearItem);
                }

                // Alt giyim
                if (newOutfit.bottomwear) {
                    const bottomwearItem = document.createElement('div');
                    bottomwearItem.className = 'outfit-item';
                    bottomwearItem.innerHTML = `
                        <img src="${newOutfit.bottomwear.imagePath}" alt="${newOutfit.bottomwear.name}" class="outfit-image">
                        <span>${newOutfit.bottomwear.name}</span>
                    `;
                    outfitItems.appendChild(bottomwearItem);
                }

                // Ayakkabı
                if (newOutfit.footwear) {
                    const footwearItem = document.createElement('div');
                    footwearItem.className = 'outfit-item';
                    footwearItem.innerHTML = `
                        <img src="${newOutfit.footwear.imagePath}" alt="${newOutfit.footwear.name}" class="outfit-image">
                        <span>${newOutfit.footwear.name}</span>
                    `;
                    outfitItems.appendChild(footwearItem);
                }

                // Aksesuar
                if (newOutfit.accessories) {
                    const accessoryItem = document.createElement('div');
                    accessoryItem.className = 'outfit-item';
                    accessoryItem.innerHTML = `
                        <img src="${newOutfit.accessories.imagePath}" alt="${newOutfit.accessories.name}" class="outfit-image">
                        <span>${newOutfit.accessories.name}</span>
                    `;
                    outfitItems.appendChild(accessoryItem);
                }
            });
        }
    });
}

// Kombin önerisi popup'ını güncelle
function updateOutfitPopup(outfit) {
    const outfitItemsGrid = document.querySelector('.outfit-items-grid');
    if (!outfitItemsGrid) return;

    outfitItemsGrid.innerHTML = '';

    // Üst giyim
    if (outfit.upperwear) {
        const upperwearItem = document.createElement('div');
        upperwearItem.className = 'outfit-item';
        upperwearItem.innerHTML = `
            <img src="${outfit.upperwear.imagePath}" alt="${outfit.upperwear.name}" class="outfit-image">
            <span>${outfit.upperwear.name}</span>
        `;
        outfitItemsGrid.appendChild(upperwearItem);
    }

    // Alt giyim
    if (outfit.bottomwear) {
        const bottomwearItem = document.createElement('div');
        bottomwearItem.className = 'outfit-item';
        bottomwearItem.innerHTML = `
            <img src="${outfit.bottomwear.imagePath}" alt="${outfit.bottomwear.name}" class="outfit-image">
            <span>${outfit.bottomwear.name}</span>
        `;
        outfitItemsGrid.appendChild(bottomwearItem);
    }

    // Ayakkabı
    if (outfit.footwear) {
        const footwearItem = document.createElement('div');
        footwearItem.className = 'outfit-item';
        footwearItem.innerHTML = `
            <img src="${outfit.footwear.imagePath}" alt="${outfit.footwear.name}" class="outfit-image">
            <span>${outfit.footwear.name}</span>
        `;
        outfitItemsGrid.appendChild(footwearItem);
    }

    // Aksesuar
    if (outfit.accessories) {
        const accessoryItem = document.createElement('div');
        accessoryItem.className = 'outfit-item';
        accessoryItem.innerHTML = `
            <img src="${outfit.accessories.imagePath}" alt="${outfit.accessories.name}" class="outfit-image">
            <span>${outfit.accessories.name}</span>
        `;
        outfitItemsGrid.appendChild(accessoryItem);
    }
}

// Kombin Önerisi Popup işlemleri
document.addEventListener('DOMContentLoaded', function() {
    const outfitBtn = document.querySelector('.landing-outfit-btn');
    const outfitPopup = document.getElementById('outfitPopup');
    const closePopup = document.querySelector('.close-popup');

    // Popup'ı aç ve rastgele kombin oluştur
    outfitBtn.addEventListener('click', function() {
        // Gardırop verilerini al
        const wardrobeData = {
            upperwear: window.wardrobeData?.upperwear || [],
            bottomwear: window.wardrobeData?.bottomwear || [],
            footwear: window.wardrobeData?.footwear || [],
            accessories: window.wardrobeData?.accessories || []
        };

        // Rastgele kombin oluştur
        const randomOutfit = generateRandomOutfit(wardrobeData);
        
        // Popup'ı güncelle ve göster
        updateOutfitPopup(randomOutfit);
        outfitPopup.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Popup'ı kapat
    closePopup.addEventListener('click', function() {
        outfitPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Popup dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        if (event.target === outfitPopup) {
            outfitPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Sayfa yüklendiğinde şehirleri getir ve formları etkinleştir
window.onload = () => {
    loadCities();

    // Ana sayfa hava durumu formu
    const landingWeatherForm = document.getElementById("landingWeatherForm");
    if (landingWeatherForm) {
        landingWeatherForm.addEventListener("submit", (e) => fetchWeather(e, true));
        // Sayfa yüklendiğinde ilk şehir için hava durumunu getir
        fetchWeather(null, true);
    }

    // Detaylı hava durumu formu
    const weatherForm = document.getElementById("weatherForm");
    if (weatherForm) {
        console.log("Weather form found");
        weatherForm.addEventListener("submit", (e) => {
            console.log("Weather form submitted");
            fetchWeather(e, false);
        });
        // Sayfa yüklendiğinde ilk şehir için hava durumunu getir
        fetchWeather(null, false);
    } else {
        console.log("Weather form not found");
    }

    // Kıyafetler yüklendikten sonra kombin kartlarını güncelle
    if (window.wardrobeData) {
        updateOutfitCards();
    } else {
        // Kıyafetler henüz yüklenmediyse, yüklendikten sonra güncelle
        const checkWardrobeData = setInterval(() => {
            if (window.wardrobeData) {
                updateOutfitCards();
                clearInterval(checkWardrobeData);
            }
        }, 100);
    }
};

// Blog Slider için moda ipuçları
const fashionTips = [
    {
        title: 'Klasik Görünüm',
        description: 'Klasik bir görünüm için siyah bir elbise ve kırmızı ruj mükemmel bir seçimdir.',
        icon: 'fa-lightbulb'
    },
    {
        title: 'Minimalist Aksesuarlar',
        description: 'Kıyafetinize şıklık katmak için minimalist takılar tercih edin.',
        icon: 'fa-gem'
    },
    {
        title: 'Desen Kombinleri',
        description: 'Farklı desenleri kombinlerken, dengeyi korumak önemli. Tek bir ögeyi ön plana çıkarın ve geri kalanını nötr tutun.',
        icon: 'fa-palette'
    },
    {
        title: 'Yaz Kombini',
        description: 'Yazın en rahat kombini: Beyaz tişört, kot şort ve sandalet!',
        icon: 'fa-tshirt'
    },
    {
        title: 'Beden Tipi',
        description: 'Beden tipinize uygun giysiler giyerek hem rahat hem şık olabilirsiniz.',
        icon: 'fa-user'
    },
    {
        title: 'Renk Uyumu',
        description: 'Renk uyumu, şıklığın anahtarıdır. Renkli aksesuarlarla sade bir elbise kombinleyin.',
        icon: 'fa-paint-brush'
    },
    {
        title: 'Çanta Detayı',
        description: 'Bir çanta, kombininizi tamamlayan en önemli detaydır. Bazen küçük bir çanta, tüm görünümü değiştirir.',
        icon: 'fa-shopping-bag'
    },
    {
        title: 'Spor Ayakkabı',
        description: 'Spor ayakkabılar sadece spor yaparken değil, günlük kombinlerde de kullanılabilir.',
        icon: 'fa-shoe-prints'
    },
    {
        title: 'Mevsimsel Renkler',
        description: 'Mevsime uygun renkler seçerek, kıyafetlerinizi sezonun ruhuna uygun hale getirebilirsiniz.',
        icon: 'fa-leaf'
    },
    {
        title: 'İş Kombini',
        description: 'Gömlek ve blazer ceket kombinini, hem iş hayatınızda hem günlük yaşamda rahatça kullanabilirsiniz.',
        icon: 'fa-vest'
    }
];

let currentBlogSlide = 0;
const blogSliderTrack = document.querySelector('.blog-slider .slider-track');
const blogSliderDots = document.querySelector('.blog-slider .slider-dots');

function getRandomClothesImage() {
    const categories = ['upperwear', 'bottomwear', 'footwear', 'accessories'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryItems = window.wardrobeData?.[randomCategory] || [];
    
    if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        return randomItem.imagePath;
    }
    
    // Eğer gardırop verisi yoksa varsayılan görsel
    return 'assets/images/moda ikonu.png';
}

function updateBlogSlider() {
    if (!blogSliderTrack) return;
    
    blogSliderTrack.style.transform = `translateX(-${currentBlogSlide * 100}%)`;
    
    // Update dots
    const dots = blogSliderDots.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentBlogSlide);
    });
}

function nextBlogSlide() {
    currentBlogSlide = (currentBlogSlide + 1) % fashionTips.length;
    updateBlogSlider();
}

function prevBlogSlide() {
    currentBlogSlide = (currentBlogSlide - 1 + fashionTips.length) % fashionTips.length;
    updateBlogSlider();
}

// Initialize blog slider
function initBlogSlider() {
    if (!blogSliderTrack || !blogSliderDots) return;
    
    // Clear existing content
    blogSliderTrack.innerHTML = '';
    blogSliderDots.innerHTML = '';
    
    // Add slides
    fashionTips.forEach((tip, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'slider-item';
        slide.innerHTML = `
            <img src="${getRandomClothesImage()}" alt="${tip.title}">
            <div class="slider-content">
                <h3 class="slider-title"><i class="fas ${tip.icon}"></i> ${tip.title}</h3>
                <p class="slider-description">${tip.description}</p>
            </div>
        `;
        blogSliderTrack.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('span');
        dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            currentBlogSlide = index;
            updateBlogSlider();
        });
        blogSliderDots.appendChild(dot);
    });
    
    // Add event listeners
    const prevBtn = document.querySelector('.blog-slider .prev-btn');
    const nextBtn = document.querySelector('.blog-slider .next-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', prevBlogSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextBlogSlide);
    
    // Auto slide every 5 seconds
    setInterval(nextBlogSlide, 5000);
}

// Initialize blog slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for wardrobe data to be available
    const checkWardrobeData = setInterval(() => {
        if (window.wardrobeData) {
            initBlogSlider();
            clearInterval(checkWardrobeData);
        }
    }, 100);
});

// Yazlık ve Kışlık klasörlerinden rastgele 5 görseli ekrana getir
const YAZLIK_DIR = "assets/data/clustered_output/yazlik";
const KISLIK_DIR = "assets/data/clustered_output/kislik";
const IMG_COUNT = 5;

async function getAllImagesFromFolder(folderPath) {
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
            if (href.match(/\.(jpg|jpeg|png)$/i)) {
                images.push(folderPath + '/' + href);
            } else if (!href.includes('.')) {
                // Alt klasör ise recursive tara
                const subImages = await getAllImagesFromFolder(folderPath + '/' + href.replace('/', ''));
                images = images.concat(subImages);
            }
        }
    } catch (e) {
        console.error('Resimler alınırken hata:', e);
    }
    return images;
}

function getRandomItems(arr, n) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

async function showRandomClothes(folderPath, containerId) {
    const allImages = await getAllImagesFromFolder(folderPath);
    const randomImages = getRandomItems(allImages, IMG_COUNT);
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    randomImages.forEach(imgPath => {
        const img = document.createElement('img');
        img.src = imgPath;
        img.width = 150;
        img.height = 150;
        img.style.margin = '5px';
        img.onerror = () => { img.src = 'https://via.placeholder.com/150x150?text=No+Image'; };
        container.appendChild(img);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    showRandomClothes(YAZLIK_DIR, 'yazlik-images');
    showRandomClothes(KISLIK_DIR, 'kislik-images');
});
