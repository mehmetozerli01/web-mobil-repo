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
};

// Kombin Önerisi Popup işlemleri
document.addEventListener('DOMContentLoaded', function() {
    const outfitBtn = document.querySelector('.landing-outfit-btn');
    const outfitPopup = document.getElementById('outfitPopup');
    const closePopup = document.querySelector('.close-popup');

    // Popup'ı aç
    outfitBtn.addEventListener('click', function() {
        outfitPopup.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
    });

    // Popup'ı kapat
    closePopup.addEventListener('click', function() {
        outfitPopup.style.display = 'none';
        document.body.style.overflow = 'auto'; // Sayfa kaydırmayı tekrar etkinleştir
    });

    // Popup dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        if (event.target === outfitPopup) {
            outfitPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});
