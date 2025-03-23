const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";

// Şehirleri `cities.json` dosyasından yükle
async function loadCities() {
    try {
        const response = await fetch("assets/data/cities.json");

        const cities = await response.json();
        const citySelect = document.getElementById("citySelect");

        // Seçenekleri oluştur
        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = JSON.stringify({ lat: city.lat, lon: city.lon });
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Şehirler yüklenirken hata oluştu:", error);
    }
}

// API'den hava durumu bilgisi çek
async function fetchWeather() {
    const citySelect = document.getElementById("citySelect");
    const selectedCity = JSON.parse(citySelect.value);

    if (!selectedCity) {
        alert("Lütfen bir şehir seçin.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${apiKey}&units=metric&lang=tr`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("weather").textContent = 
            `Şehir: ${data.name}, 
             Sıcaklık: ${data.main.temp}°C, 
             Hissedilen: ${data.main.feels_like}°C, 
             Durum: ${data.weather[0].description}`;
    } catch (error) {
        document.getElementById("weather").textContent = "Hava durumu bilgisi alınamadı.";
        console.error("Hata:", error);
    }
}

// Sayfa yüklendiğinde şehirleri getir
window.onload = loadCities;
