import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import cities from '../../assets/data/cities.json';

const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";

const HomePage = () => {
  const [selectedCity, setSelectedCity] = useState<any>(cities[0]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!selectedCity) return;
    setLoading(true);
    setError('');
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${apiKey}&units=metric&lang=tr`;
      console.log('Fetching weather data from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (response.ok) {
        setWeather(data);
        console.log('Weather data set successfully:', data);
      } else {
        console.error('API Error:', data);
        setError(`Hava durumu bilgisi alınamadı. Hata: ${data.message || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Bağlantı hatası: Lütfen internet bağlantınızı kontrol edin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      console.log('Selected city changed:', selectedCity);
      fetchWeather();
    }
  }, [selectedCity]);

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {/* Şehir ve Hava Durumu Başlığı */}
        <View style={styles.weatherHeader}>
          <Text style={styles.city}>{selectedCity?.name}</Text>
          {weather && (
            <Text style={styles.temperature}>
              {Math.round(weather.main.temp)}°C{' '}
              <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
            </Text>
          )}
        </View>

        {/* Şehir Seçici */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCity?.name}
            onValueChange={(itemValue: string) => {
              const city = cities.find((c) => c.name === itemValue);
              setSelectedCity(city);
            }}
            style={styles.picker}
          >
            {cities.map((city) => (
              <Picker.Item key={city.name} label={city.name} value={city.name} />
            ))}
          </Picker>
        </View>

        {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Kombin Önerisi Bölümü */}
        <View style={styles.outfitSection}>
          <Text style={styles.sectionTitle}>Bugünkü Kombin Önerin</Text>
          
          <View style={styles.outfitContainer}>
            {/* Üst Giyim */}
            <View style={styles.outfitCategory}>
              <Text style={styles.categoryTitle}>Üst Giyim</Text>
              <View style={styles.categoryItems}>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.upperClothing]} />
                  <Text style={styles.outfitLabel}>Tişört</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.upperClothing]} />
                  <Text style={styles.outfitLabel}>Gömlek</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.upperClothing]} />
                  <Text style={styles.outfitLabel}>Sweat</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.upperClothing]} />
                  <Text style={styles.outfitLabel}>Mont</Text>
                </View>
              </View>
            </View>

            {/* Alt Giyim */}
            <View style={styles.outfitCategory}>
              <Text style={styles.categoryTitle}>Alt Giyim</Text>
              <View style={styles.categoryItems}>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.lowerClothing]} />
                  <Text style={styles.outfitLabel}>Şort</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.lowerClothing]} />
                  <Text style={styles.outfitLabel}>Pantolon</Text>
                </View>
              </View>
            </View>

            {/* Ayakkabı */}
            <View style={styles.outfitCategory}>
              <Text style={styles.categoryTitle}>Ayakkabı</Text>
              <View style={styles.categoryItems}>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.footwear]} />
                  <Text style={styles.outfitLabel}>Spor Ayakkabı</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.footwear]} />
                  <Text style={styles.outfitLabel}>Bot</Text>
                </View>
              </View>
            </View>

            {/* Aksesuarlar */}
            <View style={styles.outfitCategory}>
              <Text style={styles.categoryTitle}>Aksesuarlar</Text>
              <View style={styles.categoryItems}>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Şapka</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Bere</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Atkı</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Eldiven</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Kravat</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Gözlük</Text>
                </View>
                <View style={styles.outfitItem}>
                  <View style={[styles.placeholderImage, styles.accessory]} />
                  <Text style={styles.outfitLabel}>Saat</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Başka Kombin Öner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#eaf6fb',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  weatherHeader: {
    marginBottom: 20,
  },
  city: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#234',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '600',
    color: '#234',
  },
  weatherDesc: {
    fontSize: 20,
    color: '#666',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  outfitSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#234',
    marginBottom: 20,
    textAlign: 'center',
  },
  outfitContainer: {
    marginBottom: 20,
  },
  outfitCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#234',
    marginBottom: 12,
    paddingLeft: 4,
  },
  categoryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  outfitItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upperClothing: {
    backgroundColor: '#FFE5E5',
  },
  lowerClothing: {
    backgroundColor: '#E5E5FF',
  },
  footwear: {
    backgroundColor: '#E5FFE5',
  },
  accessory: {
    backgroundColor: '#FFE5FF',
    width: 60,
    height: 60,
  },
  outfitLabel: {
    fontSize: 14,
    color: '#234',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff7e4a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomePage;